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
    
    // Mobile-responsive camera positioning - much further back to show all planets
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      camera.position.set(0, 25, 200); // Much further back for mobile to show all planets
    } else {
      camera.position.set(0, 30, 140); // Original desktop position
    }

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
    const sunSize = 14; // Original desktop sun size
    const sunGeo = new THREE.SphereGeometry(sunSize, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sun);

    const sunGlowTex = createRadialGradientTexture('#ffd54f', '#ff6d00', 1024);
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false, color: 0xffffff }));
    const glowSize = 120; // Original desktop glow size
    sunGlow.scale.set(glowSize, glowSize, 1);
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

    // Planets with original distances and sizes
    const mercury = createPlanet(1.2, 0x9aa0a6, 24, 0.02);
    const venus = createPlanet(2.6, 0xeab676, 32, 0.015);
    const earth = createPlanet(2.8, 0x60a5fa, 42, 0.012);
    const mars = createPlanet(2.0, 0xf87171, 52, 0.010);
    const jupiter = createPlanet(8.0, 0xf59e0b, 72, 0.006);
    const saturn = createPlanet(6.5, 0xfcd34d, 92, 0.005);
    const uranus = createPlanet(4.0, 0x93c5fd, 110, 0.004);
    const neptune = createPlanet(3.8, 0x60a5fa, 126, 0.0035);

    // Saturn planetary rings (attach to planet so they orbit together)
    const saturnRings = new THREE.Mesh(
      new THREE.RingGeometry(9.5, 13.5, 128),
      new THREE.MeshBasicMaterial({ color: 0xf5deb3, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
    );
    saturnRings.rotation.x = Math.PI / 2.3;
    saturn.group.add(saturnRings);

    // Earth moon
    const moonSize = 0.9; // Original desktop moon size
    const moon = new THREE.Mesh(new THREE.SphereGeometry(moonSize, 32, 32), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 }));
    const moonPivot = new THREE.Object3D();
    moonPivot.position.x = earth.distance;
    const moonDistance = 5; // Original desktop moon distance
    moon.position.x = moonDistance;
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
      const isMobileNow = sizes.width <= 768;
      
      camera.aspect = sizes.width / sizes.height;
      
      // Update camera position for mobile/desktop
      if (isMobileNow) {
        camera.position.set(0, 25, 200); // Much further back for mobile
      } else {
        camera.position.set(0, 30, 140); // Original desktop position
      }
      
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // Shooting stars (cinematic)
    const shootingGroup = new THREE.Group();
    scene.add(shootingGroup);
    const shootTexture = createRadialGradientTexture('#ffffff', '#60a5fa', 256);
    const trailTexture = createTrailTexture(512, 64);

    function spawnShootingStar() {
      const headMaterial = new THREE.SpriteMaterial({ map: shootTexture, blending: THREE.AdditiveBlending, transparent: true, opacity: 1.0, depthWrite: false });
      const head = new THREE.Sprite(headMaterial);
      const headScale = THREE.MathUtils.randFloat(4.5, 7.5);
      head.scale.set(headScale, headScale, 1);
      // avoid center text zone: spawn from left edge and top/bottom bands
      const yBand = (Math.random() > 0.5 ? THREE.MathUtils.randFloat(60, 140) : THREE.MathUtils.randFloat(-140, -60));
      head.position.set(THREE.MathUtils.randFloat(-220, -100), yBand, THREE.MathUtils.randFloat(-40, 40));

      const speed = THREE.MathUtils.randFloat(70, 110);
      const velocity = new THREE.Vector3(THREE.MathUtils.randFloat(1.2, 2.0), -THREE.MathUtils.randFloat(0.5, 1.2), 0).normalize().multiplyScalar(speed);

      const length = THREE.MathUtils.randFloat(20, 38);
      const width = THREE.MathUtils.randFloat(1.2, 2.2);
      const trailMat = new THREE.MeshBasicMaterial({ map: trailTexture, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.95, depthWrite: false, color: 0x9fc5ff, side: THREE.DoubleSide });
      const trail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), trailMat);
      trail.scale.set(length, width, 1);

      shootingGroup.add(head);
      shootingGroup.add(trail);

      const maxLife = THREE.MathUtils.randFloat(1.6, 2.4);
      return { head, velocity, trail, elapsed: 0, maxLife, length, width };
    }

    const activeShoots: Array<{ head: THREE.Sprite; velocity: THREE.Vector3; trail: THREE.Mesh; elapsed: number; maxLife: number; length: number; width: number; }> = [];
    // Poisson gap to keep rarity and taste
    let shootTimer = THREE.MathUtils.randFloat(9, 16);

    // Animate
    const clock = new THREE.Clock();
    const animate = () => {
      const dt = clock.getDelta();

      // Smooth pointer parallax
      currentOffsetX += (targetOffsetX - currentOffsetX) * 0.05;
      currentOffsetY += (targetOffsetY - currentOffsetY) * 0.05;
      
      // Mobile-responsive camera positioning
      const isMobileNow = window.innerWidth <= 768;
      const baseY = isMobileNow ? 25 : 30;
      const baseZ = isMobileNow ? 200 : 140;
      const parallaxScale = isMobileNow ? 0.3 : 1; // Reduced parallax on mobile
      
      camera.position.x = currentOffsetX * parallaxScale;
      camera.position.y = baseY + (currentOffsetY * parallaxScale) + (scrollY * 0.01);
      camera.position.z = baseZ;
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
        p.group.children.forEach((child: THREE.Object3D) => { child.rotation.y += 0.005; });
      });

      // Moon orbit
      const moonAngle = t * 0.65;
      moonPivot.rotation.y = moonAngle;
      moon.position.x = moonDistance;

      // Shooting stars spawn/update (eased, oriented trails)
      shootTimer -= dt;
      if (shootTimer <= 0 && activeShoots.length < 1) {
        activeShoots.push(spawnShootingStar());
        shootTimer = THREE.MathUtils.randFloat(9, 16);
      }
      for (let i = activeShoots.length - 1; i >= 0; i--) {
        const s = activeShoots[i];
        s.elapsed += dt;
        const tnorm = s.elapsed / s.maxLife;
        // easing alpha in/out
        const easeOutSine = (x: number) => Math.sin((x * Math.PI) / 2);
        const easeInSine = (x: number) => 1 - Math.cos((x * Math.PI) / 2);
        let alpha = 1;
        if (tnorm < 0.2) alpha = easeOutSine(tnorm / 0.2);
        else if (tnorm > 0.8) alpha = easeInSine((1 - tnorm) / 0.2);

        // motion & slight deceleration
        s.head.position.addScaledVector(s.velocity, dt);
        s.velocity.multiplyScalar(0.998);

        // orient trail with velocity and offset behind head
        const angle = Math.atan2(s.velocity.y, s.velocity.x);
        s.trail.rotation.z = angle;
        s.trail.position.copy(s.head.position);
        const back = s.length * 0.48;
        const dir = s.velocity.clone().normalize();
        s.trail.position.addScaledVector(dir, -back);

        (s.head.material as THREE.SpriteMaterial).opacity = alpha;
        (s.trail.material as THREE.MeshBasicMaterial).opacity = 0.85 * alpha;

        if (tnorm >= 1 || s.head.position.x > 260 || s.head.position.y < -200) {
          shootingGroup.remove(s.head);
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
      scene.traverse((obj: THREE.Object3D) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: THREE.Material) => m.dispose());
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

function createTrailTexture(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const grd = ctx.createLinearGradient(0, height/2, width, height/2);
  grd.addColorStop(0.0, 'rgba(159,197,255,0)');
  grd.addColorStop(0.1, 'rgba(159,197,255,0.25)');
  grd.addColorStop(0.4, 'rgba(159,197,255,0.9)');
  grd.addColorStop(1.0, 'rgba(159,197,255,0)');

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  // Soft vertical fade for feathered edges
  const fade = ctx.createLinearGradient(0, 0, 0, height);
  fade.addColorStop(0, 'rgba(255,255,255,0)');
  fade.addColorStop(0.5, 'rgba(255,255,255,1)');
  fade.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}


