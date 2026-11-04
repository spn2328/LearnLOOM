"use client";
import {useEffect, useRef, useState} from "react";
import {atomColor, atomRadius, molecule, type MoleculeId} from "../content/molecules";

// Owner-supplied 2D drawings that replace the generated one.
const images: Partial<Record<MoleculeId, string>> = {Na2CO3: "/images/molecules/na2co3.webp", CH3OH: "/images/molecules/ch3oh-ball.webp", C2H6: "/images/molecules/c2h6.webp"};

// 2D ball-and-stick drawing (projection on the x–y plane). Also the fallback when WebGL is missing.
export function Molecule2D({id, size = 220}: {id: MoleculeId; size?: number}) {
  const img = images[id];
  if (img) return <img className="fh-mol2d fh-mol-img" src={img} alt="โครงสร้างโมเลกุล 2 มิติ" style={{maxHeight: size}} />;
  const m = molecule(id);
  const xs = m.atoms.map(a => a.p[0]), ys = m.atoms.map(a => -a.p[1]);
  const pad = 0.7, minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) + pad - minX, h = Math.max(...ys) + pad - minY;
  const order = m.atoms.map((a, i) => i).sort((a, b) => m.atoms[a].p[2] - m.atoms[b].p[2]);
  return (
    <svg className="fh-mol2d" viewBox={`${minX} ${minY} ${w} ${h}`} style={{maxHeight: size}} role="img" aria-label="โครงสร้างโมเลกุล 2 มิติ">
      {m.bonds.map(([a, b, o], i) => {
        const [x1, y1] = [m.atoms[a].p[0], -m.atoms[a].p[1]], [x2, y2] = [m.atoms[b].p[0], -m.atoms[b].p[1]];
        const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L * 0.11, ny = (x2 - x1) / L * 0.11;
        const offs = o === 1 ? [0] : o === 2 ? [-1, 1] : [-1.6, 0, 1.6];
        return offs.map(k => <line key={i + "-" + k} x1={x1 + nx * k} y1={y1 + ny * k} x2={x2 + nx * k} y2={y2 + ny * k} stroke="#8b918c" strokeWidth={0.08} strokeLinecap="round" />);
      })}
      {order.map(i => {
        const a = m.atoms[i];
        return <circle key={i} cx={a.p[0]} cy={-a.p[1]} r={atomRadius[a.el] * 0.8} fill={atomColor[a.el]} stroke="#5d625e" strokeWidth={0.03} />;
      })}
    </svg>
  );
}

// Rotatable 3D model. three.js is loaded on demand so lessons without 3D stay light.
export function Molecule3D({id, height = 260}: {id: MoleculeId; height?: number}) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let stop = false, cleanup = () => {};
    (async () => {
      try {
        const THREE = await import("three");
        const {OrbitControls} = await import("three/examples/jsm/controls/OrbitControls.js");
        const el = host.current;
        if (stop || !el) return;
        const m = molecule(id);
        const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        scene.add(new THREE.AmbientLight(0xffffff, 1.6));
        const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(3, 5, 6); scene.add(sun);
        const group = new THREE.Group(); scene.add(group);
        const center = new THREE.Vector3();
        m.atoms.forEach(a => center.add(new THREE.Vector3(...a.p)));
        center.divideScalar(m.atoms.length);
        const disposables: {dispose: () => void}[] = [];
        const sphere = new THREE.SphereGeometry(1, 32, 24); disposables.push(sphere);
        const rod = new THREE.CylinderGeometry(0.07, 0.07, 1, 16); disposables.push(rod);
        const bondMat = new THREE.MeshStandardMaterial({color: 0xb9bdb9, roughness: 0.5}); disposables.push(bondMat);
        const mats = new Map<string, InstanceType<typeof THREE.MeshStandardMaterial>>();
        let radius = 1;
        m.atoms.forEach(a => {
          if (!mats.has(a.el)) { const mt = new THREE.MeshStandardMaterial({color: atomColor[a.el], roughness: 0.35, metalness: 0.05}); mats.set(a.el, mt); disposables.push(mt); }
          const mesh = new THREE.Mesh(sphere, mats.get(a.el)!);
          const p = new THREE.Vector3(...a.p).sub(center);
          mesh.position.copy(p); mesh.scale.setScalar(atomRadius[a.el]); group.add(mesh);
          radius = Math.max(radius, p.length() + atomRadius[a.el]);
        });
        const up = new THREE.Vector3(0, 1, 0);
        m.bonds.forEach(([i, j, o]) => {
          const a = new THREE.Vector3(...m.atoms[i].p).sub(center), b = new THREE.Vector3(...m.atoms[j].p).sub(center);
          const dir = b.clone().sub(a), L = dir.length(); dir.normalize();
          let side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1));
          if (side.length() < 0.1) side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0));
          side.normalize().multiplyScalar(0.13);
          const offs = o === 1 ? [0] : o === 2 ? [-1, 1] : [-1.5, 0, 1.5];
          for (const k of offs) {
            const c = new THREE.Mesh(rod, bondMat);
            c.scale.set(1, L, 1);
            c.quaternion.setFromUnitVectors(up, dir);
            c.position.copy(a.clone().add(b).multiplyScalar(0.5).add(side.clone().multiplyScalar(k)));
            group.add(c);
          }
        });
        camera.position.set(0, 0, radius * 3.2);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.enablePan = false; controls.autoRotate = true; controls.autoRotateSpeed = 1.6;
        controls.addEventListener("start", () => { controls.autoRotate = false; });
        el.appendChild(renderer.domElement);
        const resize = () => { const w = el.clientWidth || 300; renderer.setSize(w, height); camera.aspect = w / height; camera.updateProjectionMatrix(); };
        resize();
        const ro = new ResizeObserver(resize); ro.observe(el);
        let raf = 0;
        const loop = () => { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); };
        loop();
        cleanup = () => { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); disposables.forEach(d => d.dispose()); renderer.dispose(); renderer.domElement.remove(); };
      } catch { if (!stop) setFailed(true); }
    })();
    return () => { stop = true; cleanup(); };
  }, [id, height]);
  if (failed) return <Molecule2D id={id} size={height} />;
  return <div ref={host} className="fh-mol3d" style={{height}} aria-label="แบบจำลองโมเลกุล 3 มิติ หมุนได้" />;
}

// 3D/2D toggle card used across the lesson pages.
export function MoleculeView({id, formula, name, height = 240, start = "3d"}: {id: MoleculeId; formula?: string; name?: string; height?: number; start?: "3d" | "2d"}) {
  const [mode, setMode] = useState(start);
  return (
    <div className="fh-molview">
      <div className="fh-seg" role="tablist" aria-label="รูปแบบแบบจำลอง">
        <button role="tab" aria-selected={mode === "3d"} className={mode === "3d" ? "on" : ""} onClick={() => setMode("3d")}>3D</button>
        <button role="tab" aria-selected={mode === "2d"} className={mode === "2d" ? "on" : ""} onClick={() => setMode("2d")}>2D</button>
      </div>
      {mode === "3d" ? <Molecule3D id={id} height={height} /> : <Molecule2D id={id} size={height} />}
      {mode === "3d" && <small className="fh-mol-tip">ลากเพื่อหมุนโมเลกุล</small>}
      {formula && <div className="fh-mol-formula">{formula}</div>}
      {name && <div className="fh-mol-name">{name}</div>}
    </div>
  );
}
