import React, { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, useGLTF, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'
import './ModelViewer.css'

/* ── GLB Loader (for real .glb files in /public/models/) ── */
function GLBModel({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

/* ── Mannequin Primitive ──────────────────────────────── */
function Mannequin({ color, category }) {
  const group = useRef()
  const mat   = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.08 })

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.04
    }
  })

  const M = (geom, [px,py,pz], [rx=0,ry=0,rz=0]=[]) => {
    const mesh = new THREE.Mesh(geom, mat)
    mesh.position.set(px,py,pz)
    mesh.rotation.set(rx,ry,rz)
    mesh.castShadow = true
    return mesh
  }

  const parts = []
  if (category === 'shoes') {
    parts.push(
      M(new THREE.BoxGeometry(0.38,0.13,0.7),   [0,0,0]),
      M(new THREE.BoxGeometry(0.32,0.26,0.47),   [0,0.19,-0.12]),
      M(new THREE.CylinderGeometry(.036,.036,.065,8), [-0.12,-0.07,0]),
      M(new THREE.CylinderGeometry(.036,.036,.065,8), [ 0.12,-0.07,0]),
    )
  } else if (category === 'bag') {
    parts.push(
      M(new THREE.BoxGeometry(0.62,0.46,0.21),  [0,0,0]),
      M(new THREE.TorusGeometry(0.2,0.022,8,24,Math.PI), [0,0.32,0]),
      M(new THREE.BoxGeometry(0.13,0.07,0.01),  [0,0.01,0.105]),
    )
  } else {
    // Head
    parts.push(M(new THREE.SphereGeometry(0.14,16,16),[0,1.68,0]))
    // Neck
    parts.push(M(new THREE.CylinderGeometry(.055,.06,.2,8),[0,1.46,0]))
    // Torso
    parts.push(M(new THREE.BoxGeometry(0.44,0.58,0.22),[0,1.08,0]))
    // Arms
    parts.push(M(new THREE.CylinderGeometry(.065,.055,.52,8),[-0.31,1.04,0],[0,0,0.24]))
    parts.push(M(new THREE.CylinderGeometry(.065,.055,.52,8),[ 0.31,1.04,0],[0,0,-0.24]))
    if (category === 'dress') {
      parts.push(M(new THREE.CylinderGeometry(0.32,0.24,0.38,12),[0,0.67,0]))
      parts.push(M(new THREE.CylinderGeometry(0.08,0.07,0.64,8),[-0.12,0.27,0]))
      parts.push(M(new THREE.CylinderGeometry(0.08,0.07,0.64,8),[ 0.12,0.27,0]))
    } else {
      parts.push(M(new THREE.BoxGeometry(0.4,0.26,0.2),[0,0.69,0]))
      parts.push(M(new THREE.CylinderGeometry(.084,.072,.65,8),[-0.12,0.27,0]))
      parts.push(M(new THREE.CylinderGeometry(.084,.072,.65,8),[ 0.12,0.27,0]))
    }
  }

  return (
    <group ref={group}>
      {parts.map((mesh, i) => <primitive key={i} object={mesh} />)}
    </group>
  )
}

/* ── Scene ────────────────────────────────────────────── */
function Scene({ category, color, modelUrl }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3,5,3]} intensity={1.3} castShadow color="#FFF8E7" />
      <directionalLight position={[-3,2,-2]} intensity={0.45} color="#C8A96E" />
      <pointLight position={[0,3,-1.5]} intensity={0.3} color="#00C896" />
      <Environment preset="studio" />

      <PresentationControls
        global polar={[-0.4,0.4]} azimuth={[-1,1]}
        config={{ mass:2, tension:400 }} snap={{ mass:4, tension:400 }}
      >
        <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.3}>
          <Suspense fallback={null}>
            {modelUrl
              ? <GLBModel url={modelUrl} />
              : <Mannequin color={color} category={category} />
            }
          </Suspense>
        </Float>
      </PresentationControls>

      <OrbitControls enablePan={false} minDistance={1.8} maxDistance={5.5} />

      {/* Reflective floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.06,0]} receiveShadow>
        <planeGeometry args={[8,8]} />
        <meshStandardMaterial color="#0F0F16" roughness={0.9} />
      </mesh>
    </>
  )
}

/* ── Export ───────────────────────────────────────────── */
export default function ModelViewer({ category = 'shirt', color = '#C8A96E', modelUrl = null }) {
  const [ready, setReady] = useState(false)

  return (
    <div className="model-viewer">
      {!ready && (
        <div className="viewer-loading">
          <div className="spinner spinner-gold" />
          <span>Initialising WebGL…</span>
        </div>
      )}
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 3.6], fov: 44 }}
        onCreated={() => setReady(true)}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene category={category} color={color} modelUrl={modelUrl} />
      </Canvas>
      <div className="viewer-hint">drag · rotate &nbsp;|&nbsp; scroll · zoom</div>
    </div>
  )
}
