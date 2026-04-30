import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import './RestaurantScene.css'

const TABLE_DATA = [
  { id:1, x:-2.8, z:-0.3, status:'available' },
  { id:2, x:-0.9, z: 0.4, status:'reserved'  },
  { id:3, x: 0.9, z:-0.3, status:'available' },
  { id:4, x: 2.8, z: 0.4, status:'available' },
]

function Table({ id, x, z, status, isSelected, onSelect }) {
  const dotRef = useRef()
  useFrame(({ clock }) => {
    if (dotRef.current && status === 'available') {
      dotRef.current.material.emissiveIntensity = 2 + Math.sin(clock.elapsedTime * 2.5 + id) * 1.5
    }
  })

  const topColor  = isSelected ? '#C8A96E' : status === 'reserved' ? '#3a1520' : '#1c1c26'
  const dotColor  = status === 'available' ? '#00C896' : '#E8304A'

  return (
    <group position={[x, 0, z]} onClick={() => status === 'available' && onSelect(id)}>
      {/* Table top */}
      <mesh position={[0, 0.43, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.065, 24]} />
        <meshStandardMaterial color={topColor} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.44, 8]} />
        <meshStandardMaterial color="#111118" roughness={0.6} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.04, 16]} />
        <meshStandardMaterial color="#111118" roughness={0.7} />
      </mesh>
      {/* Status dot */}
      <mesh ref={dotRef} position={[0, 0.53, 0]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color={dotColor} emissive={dotColor} emissiveIntensity={2} />
      </mesh>
      {/* Chairs */}
      {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((rot, i) => (
        <group key={i} position={[Math.sin(rot)*0.7, 0, Math.cos(rot)*0.7]}>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.3,0.04,0.3]} />
            <meshStandardMaterial color="#1a1a24" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.39, -0.13]}>
            <boxGeometry args={[0.3,0.3,0.04]} />
            <meshStandardMaterial color="#1a1a24" roughness={0.85} />
          </mesh>
          {/* Legs */}
          {[[-0.12,0,0.12],[0.12,0,0.12],[-0.12,0,-0.12],[0.12,0,-0.12]].map(([lx,,lz],j)=>(
            <mesh key={j} position={[lx,0.11,lz]}>
              <cylinderGeometry args={[0.014,0.014,0.22,4]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function PendantLights() {
  return (
    <>
      {[-2.8,-0.9,0.9,2.8].map((x,i) => (
        <group key={i} position={[x, 2.8, 0]}>
          <mesh>
            <sphereGeometry args={[0.07,8,8]} />
            <meshStandardMaterial color="#E8C98A" emissive="#C8A96E" emissiveIntensity={3} />
          </mesh>
          <pointLight color="#E8C98A" intensity={0.9} distance={3.5} decay={2} />
          <mesh position={[0,0.45,0]}>
            <cylinderGeometry args={[0.004,0.004,0.9,4]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Scene({ selectedTable, onSelect }) {
  return (
    <>
      <ambientLight intensity={0.22} color="#1a1020" />
      <directionalLight position={[0,5,2]} intensity={0.35} color="#FFF8E7" castShadow />
      <PendantLights />
      {/* Floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]} receiveShadow>
        <planeGeometry args={[14,10]} />
        <meshStandardMaterial color="#12121A" roughness={0.95} />
      </mesh>
      {/* Walls */}
      {[
        { pos:[0,2,-4.8],   rot:[0,0,0],         w:14, h:4 },
        { pos:[-7,2,0],     rot:[0,Math.PI/2,0],  w:10, h:4 },
        { pos:[7,2,0],      rot:[0,-Math.PI/2,0], w:10, h:4 },
      ].map(({pos,rot,w,h},i) => (
        <mesh key={i} position={pos} rotation={rot}>
          <planeGeometry args={[w,h]} />
          <meshStandardMaterial color="#0D0D15" roughness={1} />
        </mesh>
      ))}
      {TABLE_DATA.map(t => (
        <Table key={t.id} {...t} isSelected={selectedTable===t.id} onSelect={onSelect} />
      ))}
      <Environment preset="night" />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={10}
        maxPolarAngle={Math.PI/2.2} target={[0,0.4,0]} />
    </>
  )
}

export default function RestaurantScene({ selectedTable, onSelect }) {
  return (
    <div className="r-scene">
      <div className="r-legend">
        {[{c:'var(--jade)',l:'Available'},{c:'var(--crimson)',l:'Reserved'},{c:'var(--gold)',l:'Selected'}].map(({c,l})=>(
          <span key={l} className="legend-item"><span className="legend-dot" style={{background:c}}/>{l}</span>
        ))}
      </div>
      <Canvas shadows camera={{position:[0,5,7.5],fov:50}} style={{height:'100%'}}>
        <Scene selectedTable={selectedTable} onSelect={onSelect} />
      </Canvas>
      {selectedTable && (
        <div className="r-selection">Table {selectedTable} selected — fill the reservation form below ↓</div>
      )}
    </div>
  )
}
