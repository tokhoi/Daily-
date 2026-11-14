import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GIcon } from './GIcon';

export type Bear3DAnim =
  | 'idle'
  | 'clap'
  | 'wave'
  | 'poke'
  | 'dance'
  | 'sleep'
  | 'flex'
  | 'cry'
  | 'heart_pose'
  | 'dab';

export type Bear3DVariant = 'pink' | 'blue';

interface Bear3DCanvasProps {
  anim: Bear3DAnim;
  variant: Bear3DVariant;
  height?: number;
  onTapBear?: () => void;
}

function createPlushTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const v = 232 + Math.floor(Math.random() * 23);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createRadialGradientTexture(
  innerColor: string,
  outerColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(1, outerColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

function createChubbyHeadGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.86, 48, 40);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const cheekFactor = y < 0 ? 1 + Math.abs(y) * 0.16 : 1 - y * 0.08;
    x *= cheekFactor * 1.07;
    z *= cheekFactor * 0.96;
    y *= 0.94;

    if (z > 0 && y < 0.15) {
      z += 0.07 * Math.max(0, 1 - Math.abs(x) * 1.4);
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function createTorsoGeometry(): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.0, -0.82),
    new THREE.Vector2(0.45, -0.78),
    new THREE.Vector2(0.76, -0.58),
    new THREE.Vector2(0.86, -0.25),
    new THREE.Vector2(0.82, 0.12),
    new THREE.Vector2(0.68, 0.45),
    new THREE.Vector2(0.48, 0.68),
    new THREE.Vector2(0.0, 0.74),
  ];
  const spline = new THREE.SplineCurve(pts);
  const geo = new THREE.LatheGeometry(spline.getPoints(36), 44);
  geo.scale(1.02, 1.0, 0.9);
  geo.computeVertexNormals();
  return geo;
}

function createHeartGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.25);
  shape.bezierCurveTo(0, 0.25, -0.05, 0.4, -0.2, 0.4);
  shape.bezierCurveTo(-0.4, 0.4, -0.4, 0.15, -0.4, 0.15);
  shape.bezierCurveTo(-0.4, -0.05, -0.2, -0.22, 0, -0.35);
  shape.bezierCurveTo(0.2, -0.22, 0.4, -0.05, 0.4, 0.15);
  shape.bezierCurveTo(0.4, 0.15, 0.4, 0.4, 0.2, 0.4);
  shape.bezierCurveTo(0.05, 0.4, 0, 0.25, 0, 0.25);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  });
  geo.center();
  geo.scale(0.32, 0.32, 0.32);
  return geo;
}

export const Bear3DCanvas: React.FC<Bear3DCanvasProps> = ({
  anim,
  variant,
  height = 290,
  onTapBear,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<Bear3DAnim>(anim);
  const variantRef = useRef<Bear3DVariant>(variant);
  const onTapRef = useRef(onTapBear);
  const squashRef = useRef(0);

  useEffect(() => {
    animRef.current = anim;
  }, [anim]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  useEffect(() => {
    onTapRef.current = onTapBear;
  }, [onTapBear]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3-Point Studio + Hemisphere Lighting
    scene.add(new THREE.HemisphereLight(0xfff5fa, 0xc7d2fe, 1.15));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
    keyLight.position.set(3.2, 5.5, 4.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfbcfe8, 0.75);
    fillLight.position.set(-3.5, 1.5, 3.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    rimLight.position.set(-2.5, 3.5, -4.0);
    scene.add(rimLight);

    const plushTex = createPlushTexture();
    const shadowTex = createRadialGradientTexture(
      'rgba(30, 58, 138, 0.22)',
      'rgba(30, 58, 138, 0)'
    );

    const furMat = new THREE.MeshPhysicalMaterial({
      color: variant === 'pink' ? 0xf9a8d4 : 0x7dd3fc,
      map: plushTex,
      roughness: 0.78,
      sheen: 0.9,
      sheenRoughness: 0.65,
      sheenColor: new THREE.Color(0xffffff),
    });

    const accentFurMat = new THREE.MeshPhysicalMaterial({
      color: variant === 'pink' ? 0xf472b6 : 0x3b82f6,
      map: plushTex,
      roughness: 0.72,
      sheen: 0.8,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xfff1f6),
    });

    const bellyMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff8fb,
      map: plushTex,
      roughness: 0.82,
      sheen: 0.6,
      sheenColor: new THREE.Color(0xffffff),
    });

    const scarfMat = new THREE.MeshPhysicalMaterial({
      color: variant === 'pink' ? 0x1e3a8a : 0xf472b6,
      map: plushTex,
      roughness: 0.68,
      sheen: 0.7,
      sheenColor: new THREE.Color(0xffe4e6),
    });

    const eyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x172554,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    });

    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.75,
      transparent: true,
      opacity: 0.58,
    });
    const tearMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      roughness: 0.1,
      clearcoat: 1,
      transparent: true,
      opacity: 0.85,
    });
    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      roughness: 0.25,
      clearcoat: 0.8,
    });

    // Ground Contact Shadow
    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 32),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
      })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -1.58, 0);
    scene.add(shadowMesh);

    // Root & Torso Pivot
    const bear = new THREE.Group();
    scene.add(bear);

    const torsoGroup = new THREE.Group();
    bear.add(torsoGroup);

    const torso = new THREE.Mesh(createTorsoGeometry(), furMat);
    torso.position.set(0, -0.58, 0);
    torsoGroup.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.58, 32, 32), bellyMat);
    belly.scale.set(0.95, 1.06, 0.52);
    belly.position.set(0, -0.68, 0.5);
    torsoGroup.add(belly);

    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), bellyMat);
    tail.position.set(0, -1.06, -0.74);
    torsoGroup.add(tail);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.13, 18, 36), scarfMat);
    collar.rotation.x = Math.PI / 2 + 0.08;
    collar.position.set(0, 0.08, 0.02);
    torsoGroup.add(collar);

    const collarKnot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), scarfMat);
    collarKnot.scale.set(1.2, 0.9, 0.8);
    collarKnot.position.set(0.24, 0.02, 0.45);
    torsoGroup.add(collarKnot);

    // Head Group + Articulated Ears + Expressive Face
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.72, 0.02);
    torsoGroup.add(headGroup);

    const head = new THREE.Mesh(createChubbyHeadGeometry(), furMat);
    headGroup.add(head);

    const makeEar = (side: -1 | 1) => {
      const ear = new THREE.Group();
      ear.position.set(side * 0.64, 0.62, -0.06);
      ear.rotation.z = side * -0.32;
      const outer = new THREE.Mesh(new THREE.SphereGeometry(0.29, 24, 24), furMat);
      outer.scale.set(1, 0.95, 0.68);
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), bellyMat);
      inner.scale.set(1, 0.95, 0.42);
      inner.position.set(0, -0.01, 0.145);
      ear.add(outer, inner);
      return ear;
    };
    const leftEar = makeEar(-1);
    const rightEar = makeEar(1);
    headGroup.add(leftEar, rightEar);

    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 24), bellyMat);
    muzzle.scale.set(1.2, 0.84, 0.68);
    muzzle.position.set(0, -0.18, 0.72);
    headGroup.add(muzzle);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), eyeMat);
    nose.scale.set(1.25, 0.85, 0.75);
    nose.position.set(0, -0.08, 0.92);
    headGroup.add(nose);

    const smileCurveLeft = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, -0.2, 0.88),
      new THREE.Vector3(-0.07, -0.25, 0.91),
      new THREE.Vector3(0, -0.19, 0.92),
    ]);
    const smileCurveRight = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.19, 0.92),
      new THREE.Vector3(0.07, -0.25, 0.91),
      new THREE.Vector3(0.14, -0.2, 0.88),
    ]);
    const smileLeft = new THREE.Mesh(new THREE.TubeGeometry(smileCurveLeft, 14, 0.018, 8, false), eyeMat);
    const smileRight = new THREE.Mesh(new THREE.TubeGeometry(smileCurveRight, 14, 0.018, 8, false), eyeMat);
    headGroup.add(smileLeft, smileRight);

    const mouthOpen = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), accentFurMat);
    mouthOpen.scale.set(1.0, 1.25, 0.5);
    mouthOpen.position.set(0, -0.24, 0.9);
    mouthOpen.visible = false;
    headGroup.add(mouthOpen);

    const makeEye = (side: -1 | 1) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.31, 0.07, 0.76);
      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.105, 22, 22), eyeMat);
      eyeball.scale.set(1, 1.08, 0.78);
      const glintBig = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), whiteMat);
      glintBig.position.set(-0.032, 0.038, 0.072);
      const glintSmall = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), whiteMat);
      glintSmall.position.set(0.03, -0.025, 0.076);
      eyeGroup.add(eyeball, glintBig, glintSmall);
      return eyeGroup;
    };
    const leftEye = makeEye(-1);
    const rightEye = makeEye(1);
    headGroup.add(leftEye, rightEye);

    // Tear streams (visible in 'cry' meme mode)
    const tearGroup = new THREE.Group();
    const leftTear = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.16, 6, 10), tearMat);
    leftTear.position.set(-0.32, -0.08, 0.77);
    const rightTear = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.16, 6, 10), tearMat);
    rightTear.position.set(0.32, -0.08, 0.77);
    tearGroup.add(leftTear, rightTear);
    tearGroup.visible = false;
    headGroup.add(tearGroup);

    const leftBrow = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.085, 6, 10), accentFurMat);
    leftBrow.rotation.z = Math.PI / 2 + 0.14;
    leftBrow.position.set(-0.32, 0.25, 0.77);
    const rightBrow = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.085, 6, 10), accentFurMat);
    rightBrow.rotation.z = Math.PI / 2 - 0.14;
    rightBrow.position.set(0.32, 0.25, 0.77);
    headGroup.add(leftBrow, rightBrow);

    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), cheekMat);
    leftCheek.scale.set(1.25, 0.72, 0.32);
    leftCheek.position.set(-0.52, -0.1, 0.67);
    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), cheekMat);
    rightCheek.scale.set(1.25, 0.72, 0.32);
    rightCheek.position.set(0.52, -0.1, 0.67);
    headGroup.add(leftCheek, rightCheek);

    // 2-Segment Articulated Arms (Shoulder -> Upper Arm -> Elbow -> Forearm + Paw)
    const upperArmGeo = new THREE.CapsuleGeometry(0.155, 0.16, 14, 20);
    const forearmGeo = new THREE.CapsuleGeometry(0.145, 0.16, 14, 20);

    const makeArticulatedArm = (side: -1 | 1) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.72, -0.14, 0.12);

      const upperMesh = new THREE.Mesh(upperArmGeo, furMat);
      upperMesh.position.set(side * 0.04, -0.12, 0.02);
      upperMesh.rotation.z = side * 0.28;
      shoulder.add(upperMesh);

      const elbow = new THREE.Group();
      elbow.position.set(side * 0.11, -0.26, 0.04);
      const forearmMesh = new THREE.Mesh(forearmGeo, accentFurMat);
      forearmMesh.position.set(0, -0.12, 0.04);
      elbow.add(forearmMesh);

      shoulder.add(elbow);
      return { shoulder, elbow };
    };

    const leftArm = makeArticulatedArm(-1);
    const rightArm = makeArticulatedArm(1);
    torsoGroup.add(leftArm.shoulder, rightArm.shoulder);

    // Articulated Legs + Feet with Paw Pads
    const makeArticulatedLeg = (side: -1 | 1) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.42, -1.24, 0.08);
      const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 20), accentFurMat);
      shoe.scale.set(0.95, 0.72, 1.25);
      shoe.position.set(0, -0.12, 0.1);
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 16), bellyMat);
      pad.scale.set(0.9, 0.85, 0.3);
      pad.position.set(0, -0.14, 0.41);
      hip.add(shoe, pad);
      return hip;
    };
    const leftLeg = makeArticulatedLeg(-1);
    const rightLeg = makeArticulatedLeg(1);
    bear.add(leftLeg, rightLeg);

    // Real 3D Heart Particles
    const heartGeo = createHeartGeometry();
    const heartGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const h = new THREE.Mesh(heartGeo, heartMat);
      h.position.set((i - 1.5) * 0.68, 1.65 + (i % 2) * 0.25, 0.2);
      heartGroup.add(h);
    }
    scene.add(heartGroup);

    // Pointer Drag 360° + Tap to Squash
    let isDragging = false;
    let movedDist = 0;
    let prevX = 0;
    let targetRotY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      movedDist = 0;
      prevX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      movedDist += Math.abs(dx);
      prevX = e.clientX;
      targetRotY += dx * 0.015;
    };
    const onPointerUp = () => {
      if (isDragging && movedDist < 6) {
        squashRef.current = 1.0;
        onTapRef.current?.();
      }
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

      const targetFur = currentVar === 'pink' ? 0xf9a8d4 : 0x7dd3fc;
      const targetAccent = currentVar === 'pink' ? 0xf472b6 : 0x3b82f6;
      const targetScarf = currentVar === 'pink' ? 0x1e3a8a : 0xf472b6;
      furMat.color.lerp(new THREE.Color(targetFur), 0.12);
      accentFurMat.color.lerp(new THREE.Color(targetAccent), 0.12);
      scarfMat.color.lerp(new THREE.Color(targetScarf), 0.12);

      squashRef.current *= 0.86;
      const sq = Math.sin(squashRef.current * Math.PI) * 0.14;

      // Reset all joints
      bear.position.y = 0;
      bear.rotation.z = 0;
      bear.scale.set(1 + sq, 1 - sq * 0.85, 1 + sq);
      torsoGroup.rotation.set(0, 0, 0);
      headGroup.rotation.set(0, 0, 0);
      leftEar.rotation.set(0, 0, 0.32);
      rightEar.rotation.set(0, 0, -0.32);

      leftArm.shoulder.rotation.set(0, 0, 0);
      leftArm.elbow.rotation.set(0, 0, 0);
      rightArm.shoulder.rotation.set(0, 0, 0);
      rightArm.elbow.rotation.set(0, 0, 0);

      leftLeg.rotation.set(0, 0, 0);
      rightLeg.rotation.set(0, 0, 0);

      leftEye.scale.set(1, 1, 1);
      rightEye.scale.set(1, 1, 1);
      leftBrow.position.y = 0.25;
      rightBrow.position.y = 0.25;
      leftBrow.rotation.z = Math.PI / 2 + 0.14;
      rightBrow.rotation.z = Math.PI / 2 - 0.14;
      mouthOpen.visible = false;
      tearGroup.visible = false;
      heartGroup.visible = false;

      if (currentAnim === 'idle') {
        bear.position.y = Math.sin(t * 2.1) * 0.05;
        headGroup.rotation.z = Math.sin(t * 1.3) * 0.05;
        leftEar.rotation.z = 0.32 + Math.sin(t * 2.5) * 0.05;
        rightEar.rotation.z = -0.32 - Math.sin(t * 2.5) * 0.05;
        leftArm.shoulder.rotation.z = -0.08 + Math.sin(t * 2.1) * 0.05;
        rightArm.shoulder.rotation.z = 0.08 - Math.sin(t * 2.1) * 0.05;
        if (Math.sin(t * 1.5) > 0.96) {
          leftEye.scale.y = 0.12;
          rightEye.scale.y = 0.12;
        }
      } else if (currentAnim === 'clap') {
        bear.position.y = Math.abs(Math.sin(t * 6.5)) * 0.18;
        leftArm.shoulder.rotation.set(-0.85, 0.25, -0.55);
        leftArm.elbow.rotation.set(-0.5, 0.55 + Math.sin(t * 13) * 0.45, 0);
        rightArm.shoulder.rotation.set(-0.85, -0.25, 0.55);
        rightArm.elbow.rotation.set(-0.5, -0.55 - Math.sin(t * 13) * 0.45, 0);
        headGroup.rotation.z = Math.sin(t * 6.5) * 0.08;
        leftBrow.position.y = 0.28;
        rightBrow.position.y = 0.28;
        mouthOpen.visible = true;
        heartGroup.visible = true;
        heartGroup.children.forEach((c, idx) => {
          c.position.y = 1.55 + ((t * 0.85 + idx * 0.35) % 1) * 0.85;
          c.rotation.y = t * 3;
        });
      } else if (currentAnim === 'wave') {
        bear.position.y = Math.sin(t * 2.4) * 0.05;
        rightArm.shoulder.rotation.set(-0.2, 0, 2.0);
        rightArm.elbow.rotation.z = Math.sin(t * 8) * 0.42;
        headGroup.rotation.z = -0.12;
        rightEye.scale.y = 0.2; // cute wink!
      } else if (currentAnim === 'poke') {
        bear.position.y = Math.abs(Math.sin(t * 8.5)) * 0.11;
        headGroup.rotation.x = Math.sin(t * 8.5) * 0.14;
        leftArm.shoulder.rotation.x = -0.95;
        leftArm.elbow.rotation.x = -0.45;
        rightArm.shoulder.rotation.x = -0.95;
        rightArm.elbow.rotation.x = -0.45;
        leftLeg.rotation.x = Math.sin(t * 8.5) * 0.25;
        rightLeg.rotation.x = -Math.sin(t * 8.5) * 0.25;
      } else if (currentAnim === 'dance') {
        bear.position.y = Math.abs(Math.sin(t * 7)) * 0.22;
        torsoGroup.rotation.z = Math.sin(t * 3.5) * 0.14;
        leftArm.shoulder.rotation.z = -1.2 + Math.sin(t * 7) * 0.55;
        leftArm.elbow.rotation.z = 0.65;
        rightArm.shoulder.rotation.z = 1.2 + Math.sin(t * 7) * 0.55;
        rightArm.elbow.rotation.z = -0.65;
        leftLeg.rotation.x = Math.sin(t * 7) * 0.35;
        rightLeg.rotation.x = -Math.sin(t * 7) * 0.35;
        if (!isDragging) targetRotY += 0.022;
        heartGroup.visible = true;
        heartGroup.children.forEach((c, idx) => {
          c.position.y = 1.65 + Math.sin(t * 4 + idx) * 0.25;
          c.rotation.y = t * 4;
        });
      } else if (currentAnim === 'sleep') {
        bear.position.y = -0.1 + Math.sin(t * 1.3) * 0.035;
        headGroup.rotation.set(0.28, 0, 0.2);
        leftEar.rotation.z = 0.55;
        rightEar.rotation.z = -0.55;
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
      } else if (currentAnim === 'flex') {
        bear.position.y = Math.sin(t * 4) * 0.04;
        torsoGroup.rotation.x = -0.06;
        leftArm.shoulder.rotation.set(0, 0, -1.45);
        leftArm.elbow.rotation.set(0, 0, -1.35 + Math.sin(t * 6) * 0.15);
        rightArm.shoulder.rotation.set(0, 0, 1.45);
        rightArm.elbow.rotation.set(0, 0, 1.35 - Math.sin(t * 6) * 0.15);
        leftBrow.rotation.z = Math.PI / 2 - 0.18;
        rightBrow.rotation.z = Math.PI / 2 + 0.18;
      } else if (currentAnim === 'cry') {
        bear.position.y = -0.06 + Math.abs(Math.sin(t * 12)) * 0.03;
        headGroup.rotation.set(0.18, Math.sin(t * 10) * 0.08, 0);
        leftEar.rotation.z = 0.65;
        rightEar.rotation.z = -0.65;
        leftArm.shoulder.rotation.set(-1.1, 0.2, -0.35);
        leftArm.elbow.rotation.set(-0.9, 0, 0);
        rightArm.shoulder.rotation.set(-1.1, -0.2, 0.35);
        rightArm.elbow.rotation.set(-0.9, 0, 0);
        leftEye.scale.y = 0.22;
        rightEye.scale.y = 0.22;
        tearGroup.visible = true;
        leftTear.position.y = -0.12 - ((t * 1.6) % 0.18);
        rightTear.position.y = -0.12 - (((t + 0.5) * 1.6) % 0.18);
      } else if (currentAnim === 'heart_pose') {
        bear.position.y = Math.sin(t * 3) * 0.06;
        leftArm.shoulder.rotation.set(-0.3, 0, -2.15);
        leftArm.elbow.rotation.set(0, 0, 1.15);
        rightArm.shoulder.rotation.set(-0.3, 0, 2.15);
        rightArm.elbow.rotation.set(0, 0, -1.15);
        headGroup.rotation.z = Math.sin(t * 2) * 0.07;
        heartGroup.visible = true;
        heartGroup.children.forEach((c, idx) => {
          c.position.y = 1.7 + Math.sin(t * 3.5 + idx) * 0.22;
          c.rotation.y = t * 3;
        });
      } else if (currentAnim === 'dab') {
        torsoGroup.rotation.z = 0.18;
        headGroup.rotation.set(0.32, -0.35, 0.28);
        leftArm.shoulder.rotation.set(-0.7, 0.4, -1.2);
        leftArm.elbow.rotation.set(-0.4, 0.9, 0);
        rightArm.shoulder.rotation.set(-0.2, 0, 2.15);
        rightArm.elbow.rotation.set(0, 0, 0.1);
        leftEye.scale.y = 0.2;
        rightEye.scale.y = 0.2;
      }

      const shadowScale = Math.max(0.75, 1 - bear.position.y * 0.45);
      shadowMesh.scale.set(shadowScale, shadowScale, 1);

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

const ANIM_PRESETS: {
  id: Bear3DAnim;
  label: string;
  meme: string;
  icon: string;
}[] = [
  { id: 'idle', label: 'Thở nhẹ', meme: 'Chill phết, làm ly trà sữa hông? 🧋', icon: 'pets' },
  { id: 'clap', label: 'Đỉnh nóc', meme: 'Đỉnh nóc, kịch trần, bay phấp phới! 🔥', icon: 'favorite' },
  { id: 'wave', label: 'Vẫy chào', meme: 'Hello cưng, nay tick đủ task chưa đó? 👋', icon: 'wb_sunny' },
  { id: 'poke', label: 'Chọc nhắc', meme: 'Dậy làm việc đi bạn ơi, đừng lười nữa!! 🔔', icon: 'notifications_active' },
  { id: 'dance', label: 'Quẩy meme', meme: 'Gét gô!! Hết nước chấm luôn 💃✨', icon: 'auto_awesome' },
  { id: 'sleep', label: 'Oải chưởng', meme: 'Oải cả chưởng... cho gấu ngủ xíu 💤', icon: 'bedtime' },
  { id: 'flex', label: 'Flex cơ', meme: 'Over hợp luôn! Cơ bắp uy tín chưa 💪', icon: 'fitness_center' },
  { id: 'cry', label: 'Tụt mood', meme: 'Cứu bé với, deadline dí quá trời 😭', icon: 'rainy' },
  { id: 'heart_pose', label: 'Bắn tim', meme: 'Mãi keo nha, yêu cậu x1000 🫶💖', icon: 'favorite' },
  { id: 'dab', label: 'Slay / Dab', meme: 'Slayyyy! Không làm mà đòi có ăn thì... 😎', icon: 'flag' },
];

interface BearChatMessage {
  id: string;
  sender: 'user' | 'bear';
  text: string;
  time: string;
}

const QUICK_CHAT_PROMPTS = [
  'Đỉnh nóc kịch trần!',
  'Gét gô quẩy lên',
  'Oải cả chưởng quá',
  'Bắn tim đi gấu',
  'Flex nhẹ cái xem',
  'Deadline dí quá cứu bé',
];

function getBearReply(text: string): { reply: string; anim: Bear3DAnim } {
  const lower = text.toLowerCase();
  if (lower.includes('ngủ') || lower.includes('mệt') || lower.includes('oải')) {
    return { reply: 'Oải cả chưởng thì nghỉ xíu đi bạn hiền, gấu canh giấc cho 💤', anim: 'sleep' };
  }
  if (lower.includes('cứu') || lower.includes('deadline') || lower.includes('khóc') || lower.includes('buồn')) {
    return { reply: 'Á à tụt mood hả 😭 Thở sâu 3 cái rồi gấu cổ vũ bạn làm tiếp nha!', anim: 'cry' };
  }
  if (lower.includes('tim') || lower.includes('yêu') || lower.includes('keo')) {
    return { reply: 'Bắn tim chéo chéo!! Mãi keo nha bạn tui 🫶💖', anim: 'heart_pose' };
  }
  if (lower.includes('flex') || lower.includes('cơ') || lower.includes('mạnh')) {
    return { reply: 'Nhìn bắp tay gấu nè, over hợp luôn đúng hông 💪😎', anim: 'flex' };
  }
  if (lower.includes('slay') || lower.includes('dab') || lower.includes('ngầu')) {
    return { reply: 'Slayyy hết nấc! Quả dab này 10 điểm không có nhưng 😎✨', anim: 'dab' };
  }
  if (lower.includes('gét gô') || lower.includes('nhảy') || lower.includes('quẩy')) {
    return { reply: 'Gét gô!! Hết nước chấm luôn bạn ơi 💃🔥', anim: 'dance' };
  }
  if (lower.includes('đỉnh') || lower.includes('100%') || lower.includes('xong') || lower.includes('giỏi')) {
    return { reply: 'Đỉnh nóc, kịch trần, bay phấp phới!! Vỗ tay rào rào 👏💗', anim: 'clap' };
  }
  if (lower.includes('nhắc') || lower.includes('chọc') || lower.includes('task')) {
    return { reply: 'Dậy hoàn thành việc hôm nay đi bạn ơi, lướt điện thoại hoài à 🔔😂', anim: 'poke' };
  }
  if (lower.includes('chào') || lower.includes('hello') || lower.includes('hi')) {
    return { reply: 'Hello cưng! Chúc hôm nay năng suất gấp đôi hôm qua nha ☀️', anim: 'wave' };
  }
  return {
    reply: 'Nghe uy tín phết! Giữ vững phong độ nha bạn tui 🧸🧋',
    anim: 'idle',
  };
}

export const Bear3DStudio: React.FC = () => {
  const [anim, setAnim] = useState<Bear3DAnim>('idle');
  const [variant, setVariant] = useState<Bear3DVariant>('pink');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<BearChatMessage[]>([
    {
      id: 'welcome_bear',
      sender: 'bear',
      text: 'Hello cưng! Thử các meme & khớp tay chân mới của mình đi nè 🧸✨',
      time: 'Bây giờ',
    },
  ]);

  const activePreset = ANIM_PRESETS.find((p) => p.id === anim);
  const latestBearMsg =
    [...messages].reverse().find((m) => m.sender === 'bear')?.text || activePreset?.meme;

  const handleSelectAnim = (preset: (typeof ANIM_PRESETS)[number]) => {
    setAnim(preset.id);
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev.slice(-14),
      { id: `meme_${Date.now()}`, sender: 'bear', text: preset.meme, time: now },
    ]);
  };

  const handleSendChat = (textToSend?: string) => {
    const content = (textToSend ?? chatInput).trim();
    if (!content) return;
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const { reply, anim: nextAnim } = getBearReply(content);
    setAnim(nextAnim);
    setMessages((prev) => [
      ...prev.slice(-14),
      { id: `u_${Date.now()}`, sender: 'user', text: content, time: now },
      { id: `b_${Date.now() + 1}`, sender: 'bear', text: reply, time: now },
    ]);
    if (!textToSend) setChatInput('');
  };

  return (
    <div className="animate-ios-page space-y-4 pb-6">
      <div className="relative overflow-hidden rounded-[28px] border border-pink-200/80 bg-gradient-to-b from-white via-pink-50/50 to-blue-50/40 p-4 shadow-[0_10px_32px_-10px_rgba(30,58,138,0.18)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-900">
              BÉ GẤU ĐỒNG HÀNH
            </span>
            <h2 className="mt-1 text-sm font-extrabold text-blue-950">
              Bé Gấu Tương Tác
            </h2>
          </div>

          <div className="flex gap-1.5 rounded-2xl bg-pink-50/90 p-1">
            <button
              type="button"
              onClick={() => setVariant('pink')}
              className={`ios-press rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                variant === 'pink' ? 'bg-pink-400 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Gấu Hồng
            </button>
            <button
              type="button"
              onClick={() => setVariant('blue')}
              className={`ios-press rounded-xl px-3 py-1 text-[11px] font-bold transition ${
                variant === 'blue' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Gấu Xanh
            </button>
          </div>
        </div>

        {latestBearMsg && (
          <div className="mt-2.5 rounded-2xl border border-pink-100 bg-white/90 px-3 py-2 text-center text-xs font-semibold text-blue-950 shadow-xs">
            {latestBearMsg}
          </div>
        )}

        <Bear3DCanvas
          anim={anim}
          variant={variant}
          height={285}
          onTapBear={() => {}}
        />

        <p className="text-center text-[11px] font-semibold text-slate-400">
          Kéo để xoay hoặc chạm vào bé gấu để nựng
        </p>
      </div>

      {/* Actions & Meme Grid */}
      <div className="rounded-[24px] border border-pink-100/90 bg-white/90 p-4 shadow-[0_6px_24px_-8px_rgba(30,58,138,0.08)]">
        <h3 className="mb-3 text-xs font-extrabold tracking-wide text-blue-950 uppercase">
          Biểu cảm &amp; Hoạt động
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ANIM_PRESETS.map((preset) => {
            const active = anim === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectAnim(preset)}
                className={`ios-press flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-pink-300 bg-pink-100/80 text-blue-950 shadow-xs'
                    : 'border-pink-100 bg-white text-slate-600 hover:border-pink-200'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    active ? 'bg-blue-900 text-white' : 'bg-pink-50 text-pink-400'
                  }`}
                >
                  <GIcon name={preset.icon} size={16} />
                </span>
                <span className="text-xs font-bold">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Box with Bear */}
      <div className="rounded-[24px] border border-pink-100/90 bg-white/90 p-4 shadow-[0_6px_24px_-8px_rgba(30,58,138,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-extrabold tracking-wide text-blue-950 uppercase">
            Khung Chat với Bé Gấu
          </h3>
          <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-500">
            Trực tuyến
          </span>
        </div>

        <div className="mb-3 max-h-48 space-y-2 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed font-medium ${
                  msg.sender === 'user'
                    ? 'rounded-br-sm bg-blue-900 text-white'
                    : 'rounded-bl-sm bg-pink-50 text-blue-950'
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-slate-400">{msg.time}</span>
            </div>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {QUICK_CHAT_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSendChat(q)}
              className="ios-press rounded-full border border-pink-100 bg-pink-50/70 px-2.5 py-1 text-[11px] font-semibold text-blue-900"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendChat();
            }}
            placeholder="Nhắn meme cho bé gấu..."
            className="flex-1 rounded-2xl border border-pink-100 bg-pink-50/40 px-3.5 py-2.5 text-xs font-medium text-blue-950 outline-hidden focus:border-pink-300"
          />
          <button
            type="button"
            onClick={() => handleSendChat()}
            className="ios-press rounded-2xl bg-blue-900 px-4 text-xs font-bold text-white"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};
