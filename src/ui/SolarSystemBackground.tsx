import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Sizes = { width: number; height: number; };

export const SolarSystemBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current!;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 30, 140);

    // Post atmosphere fog
    scene.fog = new THREE.FogExp2(0x04060a, 0.002);

    // Stars background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 4000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = THREE.MathUtils.randFloat(200, 900);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x9fb3ff, size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0.9 });
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // Shooting stars
    const shootingGroup = new THREE.Group();
    scene.add(shootingGroup);
    const shootTexture = createRadialGradientTexture('#ffffff', '#60a5fa', 256);
    function spawnShootingStar() {
      const mat = new THREE.SpriteMaterial({ map: shootTexture, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.95, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      const scale = THREE.MathUtils.randFloat(4, 10);
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(THREE.MathUtils.randFloat(-200, -60), THREE.MathUtils.randFloat(40, 120), THREE.MathUtils.randFloat(-60, 60));
      const velocity = new THREE.Vector3(THREE.MathUtils.randFloat(1.6, 3.0), -THREE.MathUtils.randFloat(0.6, 1.4), 0);
      const trail = createTrail();
      shootingGroup.add(sprite);
      shootingGroup.add(trail);
      return { sprite, velocity, trail, life: THREE.MathUtils.randFloat(1.2, 2.0) };
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
    let shootTimer = 0;

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
      stars.rotation.y += 0.0008;
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
        shootTimer = THREE.MathUtils.randFloat(1.8, 3.4);
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

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
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
  }, []);

  return (
    <div ref={containerRef} className="solar-bg" aria-hidden="true" />
  );
};

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


