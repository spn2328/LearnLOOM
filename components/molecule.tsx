"use client";
import {lazy, Suspense} from 'react';
export {formula, moleculeAtoms, Molecule2D} from './molecule-2d';
const Viewer = lazy(() => import('./molecule-viewer'));
export default function MoleculeViewer() {
  return <Suspense fallback={<p role="status">กำลังโหลดแบบจำลอง…</p>}><Viewer/></Suspense>;
}
