import React, { useRef, useMemo } from "react";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BufferGeometry, Material, InstancedMesh } from "three";

export interface MESH_REF_TYPE {
  current: null | InstancedMesh;
}

function Point() {
  const number = 10000;
  const meshRef: MESH_REF_TYPE = useRef(null);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const SEPARATION = 100;
  const AMOUNTX = 50;
  const AMOUNTY = 50;
  let count = 0;

  const angleToRadians = (angleInDeg: number) => (Math.PI / 180) * angleInDeg;
  useFrame((state) => {
    if (orbitControlsRef.current) {
      const { x, y } = state.mouse;
      orbitControlsRef.current.setAzimuthalAngle(x * angleToRadians(45));
      orbitControlsRef.current.setPolarAngle(-y + 0.5 * angleToRadians(180));
      orbitControlsRef.current.update();
    }
  });

  const { vec, transform, positions } = useMemo(() => {
    const vec = new THREE.Vector3();
    const transform = new THREE.Matrix4();
    const positions = [...Array(number)].map(() => {
      const position = new THREE.Vector3();
      return position;
    });

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i].setX(ix * SEPARATION - (AMOUNTX * SEPARATION) / 2);
        positions[i].setY(0);
        positions[i].setZ(iy * SEPARATION - (AMOUNTY * SEPARATION) / 2);
        i++;
      }
    }
    return { vec, transform, positions };
  }, []);

  useFrame(() => {
    let i = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        vec
          .copy(positions[i])
          .setY(
            Math.sin((ix + count) * 0.3) * 50 +
              Math.sin((iy + count) * 0.5) * 50
          );
        i++;
        transform.setPosition(vec);
        if (meshRef !== null) {
          meshRef?.current?.setMatrixAt(i, transform);
        }
      }
    }
    count += 0.1;
    if (meshRef.current !== null) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1000, 640]} />
      <OrbitControls
        ref={orbitControlsRef}
        minPolarAngle={angleToRadians(60)}
        enableZoom={false}
      />
      <instancedMesh
        ref={meshRef}
        args={[
          null as unknown as BufferGeometry,
          null as unknown as Material,
          number,
        ]}
      >
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </instancedMesh>
      <ambientLight args={["#ffffff", 1]} />
    </>
  );
}

function Three() {
  return (
    <Canvas
      // orthographic={false}
      // camera={{ position: [0, 0, 10], fov: 75, near: 0.1, far: 1000 }}
      style={{
        height: "100vh",
        backgroundImage: "linear-gradient(-200deg, #595AEC 1%, #111745 58%)",
      }}
    >
      <Point />
    </Canvas>
  );
}

React.memo(Point);
export default React.memo(Three);
