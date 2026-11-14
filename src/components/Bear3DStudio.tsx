import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GIcon } from './GIcon';

export type Bear3DAnim = 'idle' | 'clap' | 'wave' | 'poke' | 'dance' | 'sleep';
export type Bear3DVariant = 'pink' | 'blue';

interface Bear3DCanvasProps {
  anim: Bear3DAnim;
  variant: Bear3DVariant;
  height?: number;
}

export const Bear3DCanvas: React.FC<Bear3DCanvasProps> = ({
  anim,
  variant,
  height = 290,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<Bear3DAnim>(anim);
  const variantRef = useRef<Bear3DVariant>(variant);

  useEffect(() => {
    animRef.current = anim;
  }, [anim]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Soft studio lighting (Duolingo-style plush rim lighting)
    const ambient = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff1f6, 1.6);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    // Materials (mutated cleanly when variant changes)
    const furMat = new THREE.MeshStandardMaterial({
      color: variant === 'pink' ? 0xf9a8d4 : 0x60a5fa,
      roughness: 0.72,
      metalness: 0.05,
    });
    const accentFurMat = new THREE.MeshStandardMaterial({
      color: variant === 'pink' ? 0xf472b6 : 0x1e3a8a,
      roughness: 0.65,
      metalness: 0.05,
    });
    const bellyMat = new THREE.MeshStandardMaterial({
      color: 0xfff5f8,
      roughness: 0.8,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.2,
      metalness: 0.2,
    });
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.6,
      transparent: true,
      opacity: 0.65,
    });
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.3,
    });

    // Build Bear Group
    const bear = new THREE.Group();
    scene.add(bear);

    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 32), furMat);
    body.scale.set(1, 1.08, 0.92);
    body.position.set(0, -0.55, 0);
    bear.add(body);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 28), bellyMat);
    belly.scale.set(1, 1.05, 0.55);
    belly.position.set(0, -0.58, 0.62);
    bear.add(belly);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.65, 0);
    bear.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.88, 32, 32), furMat);
    head.scale.set(1.06, 0.95, 0.96);
    headGroup.add(head);

    // Ears
    const leftEar = new THREE.Group();
    leftEar.position.set(-0.68, 0.68, -0.05);
    const leftEarOuter = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), furMat);
    const leftEarInner = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), bellyMat);
    leftEarInner.position.set(0, 0, 0.17);
    leftEar.add(leftEarOuter, leftEarInner);
    headGroup.add(leftEar);

    const rightEar = new THREE.Group();
    rightEar.position.set(0.68, 0.68, -0.05);
    const rightEarOuter = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), furMat);
    const rightEarInner = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), bellyMat);
    rightEarInner.position.set(0, 0, 0.17);
    rightEar.add(rightEarOuter, rightEarInner);
    headGroup.add(rightEar);

    // Muzzle & Nose
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), bellyMat);
    muzzle.scale.set(1.15, 0.85, 0.7);
    muzzle.position.set(0, -0.16, 0.72);
    headGroup.add(muzzle);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), eyeMat);
    nose.scale.set(1.2, 0.8, 0.8);
    nose.position.set(0, -0.08, 0.94);
    headGroup.add(nose);

    // Eyes
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), eyeMat);
    leftEye.position.set(-0.32, 0.08, 0.78);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), eyeMat);
    rightEye.position.set(0.32, 0.08, 0.78);
    headGroup.add(leftEye, rightEye);

    // Cheeks
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), cheekMat);
    leftCheek.scale.set(1.2, 0.7, 0.4);
    leftCheek.position.set(-0.52, -0.1, 0.68);
    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), cheekMat);
    rightCheek.scale.set(1.2, 0.7, 0.4);
    rightCheek.position.set(0.52, -0.1, 0.68);
    headGroup.add(leftCheek, rightCheek);

    // Arms (pivoted at shoulders)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.82, -0.2, 0.1);
    const leftArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.45, 12, 16), accentFurMat);
    leftArmMesh.position.set(-0.1, -0.25, 0.12);
    leftArmMesh.rotation.z = 0.4;
    leftArm.add(leftArmMesh);
    bear.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.82, -0.2, 0.1);
    const rightArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.45, 12, 16), accentFurMat);
    rightArmMesh.position.set(0.1, -0.25, 0.12);
    rightArmMesh.rotation.z = -0.4;
    rightArm.add(rightArmMesh);
    bear.add(rightArm);

    // Feet
    const leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), accentFurMat);
    leftFoot.scale.set(1, 0.72, 1.25);
    leftFoot.position.set(-0.46, -1.42, 0.25);
    const rightFoot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), accentFurMat);
    rightFoot.scale.set(1, 0.72, 1.25);
    rightFoot.position.set(0.46, -1.42, 0.25);
    bear.add(leftFoot, rightFoot);

    // Floating hearts for clap/dance
    const heartGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const h = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), heartMat);
      h.position.set((i - 1.5) * 0.7, 1.6 + (i % 2) * 0.3, 0.2);
      heartGroup.add(h);
    }
    scene.add(heartGroup);

    // Pointer Drag to Rotate 360
    let isDragging = false;
    let prevX = 0;
    let targetRotY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      targetRotY += dx * 0.015;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const currentAnim = animRef.current;
      const currentVar = variantRef.current;

      // Update fur color smoothly
      const targetFur = currentVar === 'pink' ? 0xf9a8d4 : 0x60a5fa;
      const targetAccent = currentVar === 'pink' ? 0xf472b6 : 0x1e3a8a;
      furMat.color.lerp(new THREE.Color(targetFur), 0.12);
      accentFurMat.color.lerp(new THREE.Color(targetAccent), 0.12);

      // Reset base transforms
      bear.position.y = 0;
      bear.rotation.z = 0;
      headGroup.rotation.set(0, 0, 0);
      leftArm.rotation.set(0, 0, 0);
      rightArm.rotation.set(0, 0, 0);
      leftEye.scale.y = 1;
      rightEye.scale.y = 1;
      heartGroup.visible = false;

      if (currentAnim === 'idle') {
        bear.position.y = Math.sin(t * 2.2) * 0.06;
        headGroup.rotation.z = Math.sin(t * 1.4) * 0.06;
        leftArm.rotation.z = Math.sin(t * 2.2) * 0.08;
        rightArm.rotation.z = -Math.sin(t * 2.2) * 0.08;
        // Blink every ~4s
        if (Math.sin(t * 1.6) > 0.96) {
          leftEye.scale.y = 0.15;
          rightEye.scale.y = 0.15;
        }
      } else if (currentAnim === 'clap') {
        bear.position.y = Math.abs(Math.sin(t * 6)) * 0.18;
        leftArm.rotation.z = 0.9;
        leftArm.rotation.y = Math.sin(t * 12) * 0.55 + 0.35;
        rightArm.rotation.z = -0.9;
        rightArm.rotation.y = -Math.sin(t * 12) * 0.55 - 0.35;
        headGroup.rotation.z = Math.sin(t * 6) * 0.08;
        heartGroup.visible = true;
        heartGroup.children.forEach((c, idx) => {
          c.position.y = 1.55 + ((t * 0.9 + idx * 0.35) % 1) * 0.8;
          c.rotation.y = t * 3;
        });
      } else if (currentAnim === 'wave') {
        bear.position.y = Math.sin(t * 2.5) * 0.05;
        rightArm.rotation.z = -2.2 + Math.sin(t * 8) * 0.35;
        headGroup.rotation.z = -0.12;
      } else if (currentAnim === 'poke') {
        bear.position.y = Math.abs(Math.sin(t * 9)) * 0.12;
        headGroup.rotation.x = Math.sin(t * 9) * 0.14;
        leftArm.rotation.x = -1.1;
        rightArm.rotation.x = -1.1;
      } else if (currentAnim === 'dance') {
        bear.position.y = Math.abs(Math.sin(t * 7)) * 0.22;
        bear.rotation.z = Math.sin(t * 3.5) * 0.16;
        leftArm.rotation.z = Math.sin(t * 7) * 0.8 + 0.6;
        rightArm.rotation.z = Math.sin(t * 7) * 0.8 - 0.6;
        if (!isDragging) targetRotY += 0.025;
        heartGroup.visible = true;
        heartGroup.children.forEach((c, idx) => {
          c.position.y = 1.6 + Math.sin(t * 4 + idx) * 0.25;
          c.rotation.y = t * 4;
        });
      } else if (currentAnim === 'sleep') {
        bear.position.y = -0.12 + Math.sin(t * 1.2) * 0.03;
        headGroup.rotation.x = 0.28;
        headGroup.rotation.z = 0.22;
        leftEye.scale.y = 0.12;
        rightEye.scale.y = 0.12;
      }

      bear.rotation.y += (targetRotY - bear.rotation.y) * 0.12;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [height]);

  return (
    <div
      ref={mountRef}
      style={{ height }}
      className="w-full cursor-grab touch-none active:cursor-grabbing"
    />
  );
};

const ANIM_PRESETS: { id: Bear3DAnim; label: string; icon: string }[] = [
  { id: 'idle', label: 'Thở nhẹ', icon: 'pets' },
  { id: 'clap', label: 'Vỗ tay 100%', icon: 'favorite' },
  { id: 'wave', label: 'Vẫy chào', icon: 'wb_sunny' },
  { id: 'poke', label: 'Chọc nhắc', icon: 'notifications_active' },
  { id: 'dance', label: 'Nhảy múa', icon: 'auto_awesome' },
  { id: 'sleep', label: 'Ngủ khò khò', icon: 'bedtime' },
];

export const Bear3DStudio: React.FC = () => {
  const [anim, setAnim] = useState<Bear3DAnim>('idle');
  const [variant, setVariant] = useState<Bear3DVariant>('pink');

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      {/* 3D Viewport Card */}
      <div className="relative overflow-hidden rounded-[28px] border border-pink-200/80 bg-gradient-to-b from-white via-pink-50/50 to-blue-50/40 p-4 shadow-[0_10px_32px_-10px_rgba(30,58,138,0.18)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
              3D STUDIO
            </span>
            <h2 className="mt-1 text-sm font-extrabold text-blue-950">
              Bé Gấu Tương Tác 360°
            </h2>
          </div>

          {/* Bear Color Toggle */}
          <div className="flex gap-1.5 rounded-2xl bg-pink-50/90 p-1">
            <button
              type="button"
              onClick={() => setVariant('pink')}
              className={`ios-press rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                variant === 'pink'
                  ? 'bg-pink-400 text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Gấu Hồng
            </button>
            <button
              type="button"
              onClick={() => setVariant('blue')}
              className={`ios-press rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                variant === 'blue'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Gấu Xanh
            </button>
          </div>
        </div>

        <Bear3DCanvas anim={anim} variant={variant} height={280} />

        <p className="text-center text-[11px] font-medium text-slate-400">
          Chạm & kéo trên màn hình để xoay bé gấu 360°
        </p>
      </div>

      {/* Animation Grid */}
      <div className="rounded-[24px] border border-pink-100 bg-white p-4 shadow-2xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
          Chọn chuyển động (Animations)
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {ANIM_PRESETS.map((p) => {
            const active = anim === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setAnim(p.id)}
                className={`ios-press flex items-center gap-2.5 rounded-2xl border p-3 text-left text-xs font-bold transition-all ${
                  active
                    ? 'border-blue-900 bg-blue-900 text-white shadow-md shadow-blue-900/20'
                    : 'border-pink-100 bg-pink-50/40 text-blue-950 hover:bg-pink-50'
                }`}
              >
                <GIcon
                  name={p.icon}
                  size={18}
                  className={active ? 'text-pink-300' : 'text-pink-500'}
                />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
