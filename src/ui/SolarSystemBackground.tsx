import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

type Sizes = { width: number; height: number; };

type Quality = 'low' | 'medium' | 'high' | 'ultra';

export type SolarSystemBackgroundApi = {
  start: () => void;
  pause: () => void;
  setIntensity: (level: number) => void;
  setParallax: (enabled: boolean) => void;
};

type Props = {
  quality?: Quality;
  reducedMotion?: boolean;
  intensity?: number;
  parallax?: boolean;
  onReady?: (api: SolarSystemBackgroundApi) => void;
};

export const SolarSystemBackground = forwardRef<SolarSystemBackgroundApi, Props>((props, ref) => {
  const { quality = 'high', reducedMotion, intensity = 0.45, parallax = true, onReady } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef<boolean>(true);
  const parallaxRef = useRef<boolean>(parallax);

  useEffect(() => {
    const container = containerRef.current!;

    // Renderer
    const isMobile = window.matchMedia('(max-width: 800px)').matches;
    const devicePR = window.devicePixelRatio || 1;
    const prCap = isMobile ? 1.5 : 2;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePR, prCap));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 30, 140);

    // No fog for a brighter look
    scene.fog = null as any;

    // Stars background (shader-based twinkle)
    const qualityToStars: Record<Quality, number> = { low: 1200, medium: 2400, high: 4000, ultra: 7000 };
    const starGeo = new THREE.BufferGeometry();
    const starCount = qualityToStars[quality];
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const r = THREE.MathUtils.randFloat(240, 1000);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = THREE.MathUtils.randFloat(0.6, 1.8);
      phases[i] = Math.random() * Math.PI * 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const starUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(devicePR, prCap) },
      uSize: { value: 3.0 },
    };
    const starMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: starUniforms,
      vertexShader: `
        uniform float uTime; 
        uniform float uPixelRatio; 
        uniform float uSize; 
        attribute float aSize; 
        attribute float aPhase; 
        varying float vTw; 
        void main(){
          vTw = 0.6 + 0.4 * sin(uTime*0.8 + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * aSize * (300.0 / -mvPosition.z) * uPixelRatio; 
          gl_Position = projectionMatrix * mvPosition; 
        }
      `,
      fragmentShader: `
        varying float vTw; 
        void main(){
          vec2 uv = gl_PointCoord - 0.5; 
          float d = 1.0 - smoothstep(0.15, 0.5, length(uv));
          vec3 color = mix(vec3(0.58,0.67,1.0), vec3(0.92,0.96,1.0), vTw);
          gl_FragColor = vec4(color, d * (0.85 + 0.15*vTw));
        }
      `
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Nebula background using large, faint billboards
    const nebulaGroup = new THREE.Group();
    const nebulaTexture = createRadialGradientTexture('#3b82f6', '#a855f7', 1024);
    const nebulaMat = new THREE.SpriteMaterial({ map: nebulaTexture, color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.18, depthWrite: false });
    for (let i = 0; i < 14; i++) {
      const sprite = new THREE.Sprite(nebulaMat.clone());
      sprite.scale.setScalar(THREE.MathUtils.randFloat(200, 600));
      sprite.position.set(THREE.MathUtils.randFloatSpread(800), THREE.MathUtils.randFloatSpread(400), -THREE.MathUtils.randFloat(200, 800));
      (sprite.material as THREE.SpriteMaterial).opacity = THREE.MathUtils.randFloat(0.06, 0.22);
      nebulaGroup.add(sprite);
    }
    scene.add(nebulaGroup);

    // Sun with glow
    const sunGroup = new THREE.Group();
    const sunGeo = new THREE.SphereGeometry(14, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sun);

    const sunGlowTex = createRadialGradientTexture('#ffd54f', '#ff6d00', 1024);
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false, color: 0xffffff }));
    sunGlow.scale.set(120, 120, 1);
    sunGroup.add(sunGlow);
    scene.add(sunGroup);

    const keyLight = new THREE.PointLight(0xffe7a3, 4.0, 0, 1.8);
    keyLight.position.set(0, 0, 0);
    scene.add(keyLight);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), Math.max(0.25, intensity - 0.1), 0.9, 0.85);
    bloom.threshold = 0.9;
    composer.addPass(bloom);

    // Vignette shader pass
    const vignetteShader = {
      uniforms: { tDiffuse: { value: null }, offset: { value: 1.2 }, darkness: { value: 0.2 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float offset; uniform float darkness; varying vec2 vUv; void main(){ vec4 texel = texture2D(tDiffuse, vUv); vec2 uv = (vUv - 0.5) * vec2(offset); float vig = smoothstep(0.8, 0.0, dot(uv, uv)); gl_FragColor = vec4(texel.rgb * mix(1.0, vig, darkness), texel.a); }`
    };
    const vignette = new ShaderPass(vignetteShader as any);
    composer.addPass(vignette);

    // Planet factory
    function createPlanet(size: number, color: number, distance: number, speed: number, tilt = 0.02) {
      const group = new THREE.Group();
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(size, 48, 48),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.0 })
      );
      planet.rotation.z = tilt;
      const pivot = new THREE.Object3D();
      pivot.position.x = distance;

      const ringGeo = new THREE.RingGeometry(distance - 0.04, distance + 0.04, 256);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);

      group.add(planet);
      scene.add(group);
      return { group, planet, speed, distance, pivot };
    }

    // Planets
    const mercury = createPlanet(1.2, 0x9aa0a6, 24, 0.02);
    const venus = createPlanet(2.6, 0xeab676, 32, 0.015);
    const earth = createPlanet(2.8, 0x60a5fa, 42, 0.012);
    const mars = createPlanet(2.0, 0xf87171, 52, 0.010);
    const jupiter = createPlanet(8.0, 0xf59e0b, 72, 0.006);
    const saturn = createPlanet(6.5, 0xfcd34d, 92, 0.005);
    const uranus = createPlanet(4.0, 0x93c5fd, 110, 0.004);
    const neptune = createPlanet(3.8, 0x60a5fa, 126, 0.0035);

    // Saturn rings
    const saturnRings = new THREE.Mesh(
      new THREE.RingGeometry(9.5, 13.5, 128),
      new THREE.MeshBasicMaterial({ color: 0xf5deb3, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
    );
    saturnRings.rotation.x = Math.PI / 2.3;
    saturnRings.position.x = saturn.distance;
    scene.add(saturnRings);

    // Earth moon
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 }));
    const moonPivot = new THREE.Object3D();
    moonPivot.position.x = earth.distance;
    moon.position.x = 5;
    scene.add(moonPivot);
    moonPivot.add(moon);

    // Camera subtle parallax
    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!parallaxRef.current) return;
      targetOffsetX = nx * 8;
      targetOffsetY = -ny * 6;
    };
    window.addEventListener('pointermove', onPointerMove);

    // Scroll-based subtle parallax
    let scrollY = window.scrollY;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize handler
    const onResize = () => {
      const sizes: Sizes = { width: window.innerWidth, height: window.innerHeight };
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, prCap));
      composer.setSize(sizes.width, sizes.height);
    };
    window.addEventListener('resize', onResize);

    // Shooting stars
    const shootingGroup = new THREE.Group();
    scene.add(shootingGroup);
    const shootTexture = createRadialGradientTexture('#ffffff', '#60a5fa', 256);
    function spawnShootingStar() {
      const mat = new THREE.SpriteMaterial({ map: shootTexture, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.95, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      const scale = THREE.MathUtils.randFloat(6, 14);
      sprite.scale.set(scale * 1.6, scale, 1);
      // avoid screen center where hero text likely exists
      const y = THREE.MathUtils.randFloat(60, 140) * (Math.random() > 0.5 ? 1 : -1);
      sprite.position.set(THREE.MathUtils.randFloat(-220, -80), y, THREE.MathUtils.randFloat(-60, 60));
      const velocity = new THREE.Vector3(THREE.MathUtils.randFloat(1.2, 2.4), -THREE.MathUtils.randFloat(0.4, 1.0), 0);
      const trail = createTrail();
      shootingGroup.add(sprite);
      shootingGroup.add(trail);
      return { sprite, velocity, trail, life: THREE.MathUtils.randFloat(1.4, 2.2) };
    }

    function createTrail() {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([0, 0, 0, -12, 4, 0, -24, 8, 0]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const material = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.8 });
      const line = new THREE.Line(geometry, material);
      return line;
    }

    const activeShoots: Array<{ sprite: THREE.Sprite; velocity: THREE.Vector3; trail: THREE.Line; life: number; }> = [];
    // Poisson process: next event in [8s, 15s]
    let shootTimer = THREE.MathUtils.randFloat(8, 15);

    // Animate
    const clock = new THREE.Clock();
    const animate = () => {
      const dt = clock.getDelta();

      // Smooth pointer parallax
      currentOffsetX += (targetOffsetX - currentOffsetX) * 0.05;
      currentOffsetY += (targetOffsetY - currentOffsetY) * 0.05;
      camera.position.x = currentOffsetX;
      camera.position.y = 30 + currentOffsetY + (scrollY * 0.01);
      camera.lookAt(0, 0, 0);

      // Rotate starfield and nebulae gently
      (starMat.uniforms as any).uTime.value += dt;
      stars.rotation.y += 0.0006;
      nebulaGroup.rotation.z += 0.0004;

      // Orbits
      const t = performance.now() * 0.0015;
      mercury.group.position.set(Math.cos(t * mercury.speed) * mercury.distance, 0, Math.sin(t * mercury.speed) * mercury.distance);
      venus.group.position.set(Math.cos(t * venus.speed) * venus.distance, 0, Math.sin(t * venus.speed) * venus.distance);
      earth.group.position.set(Math.cos(t * earth.speed) * earth.distance, 0, Math.sin(t * earth.speed) * earth.distance);
      mars.group.position.set(Math.cos(t * mars.speed) * mars.distance, 0, Math.sin(t * mars.speed) * mars.distance);
      jupiter.group.position.set(Math.cos(t * jupiter.speed) * jupiter.distance, 0, Math.sin(t * jupiter.speed) * jupiter.distance);
      saturn.group.position.set(Math.cos(t * saturn.speed) * saturn.distance, 0, Math.sin(t * saturn.speed) * saturn.distance);
      uranus.group.position.set(Math.cos(t * uranus.speed) * uranus.distance, 0, Math.sin(t * uranus.speed) * uranus.distance);
      neptune.group.position.set(Math.cos(t * neptune.speed) * neptune.distance, 0, Math.sin(t * neptune.speed) * neptune.distance);

      // Self-rotation
      [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune].forEach(p => {
        p.group.children.forEach(child => { child.rotation.y += 0.005; });
      });

      // Moon orbit
      const moonAngle = t * 0.65;
      moonPivot.rotation.y = moonAngle;
      moon.position.x = 5;

      // Shooting stars spawn/update
      shootTimer -= dt;
      if (shootTimer <= 0 && activeShoots.length < 2) {
        activeShoots.push(spawnShootingStar());
        shootTimer = THREE.MathUtils.randFloat(8, 15);
      }
      for (let i = activeShoots.length - 1; i >= 0; i--) {
        const s = activeShoots[i];
        s.life -= dt;
        s.sprite.position.addScaledVector(s.velocity, 60 * dt);
        s.trail.position.copy(s.sprite.position);
        (s.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, Math.min(1, s.life));
        if (s.life <= 0 || s.sprite.position.x > 220) {
          shootingGroup.remove(s.sprite);
          shootingGroup.remove(s.trail);
          activeShoots.splice(i, 1);
        }
      }

      composer.render();
      rafRef.current = runningRef.current ? requestAnimationFrame(animate) : null;
    };
    const prefersReduced = reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      parallaxRef.current = false;
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      scene.traverse(obj => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            (mesh.material as THREE.Material)?.dispose();
          }
        }
      });
    };
  }, [quality, reducedMotion, intensity]);

  // imperative API
  useImperativeHandle(ref, (): SolarSystemBackgroundApi => ({
    start: () => {
      if (!runningRef.current) {
        runningRef.current = true;
        rafRef.current = requestAnimationFrame(() => {});
      }
    },
    pause: () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    setIntensity: (_level: number) => {
      // Runtime tuning via dataset attribute (picked up next mount)
      const node = containerRef.current;
      if (node) node.dataset['bloom'] = String(_level);
    },
    setParallax: (enabled: boolean) => {
      parallaxRef.current = !!enabled;
    },
  }), []);

  return (
    <div ref={containerRef} className="solar-bg" aria-hidden="true" />
  );
});

function createRadialGradientTexture(innerHex: string, outerHex: string, size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size/2, size/2, size*0.1, size/2, size/2, size*0.5);
  g.addColorStop(0, innerHex);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


