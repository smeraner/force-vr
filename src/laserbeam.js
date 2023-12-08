import * as THREE from 'three';

export class LaseBeam extends THREE.Object3D {

    color = 0x00ff00;
    thickness = 0.01;
    length = 1;
    maxDistance = 100;
    speed = 1;

/**
 * 
 * @param {THREE.Scene} scene 
 */
    constructor(scene) {
        super();

        this.scene = scene;
        
        const laserGeometry = new THREE.CylinderGeometry(this.thickness, this.thickness, this.length, 8);
        const laserMaterial = new THREE.MeshStandardMaterial({ color: this.color, emissive: this.color, emissiveIntensity: 1, metalness: 0, roughness: 1 });
        const laserMesh = new THREE.Mesh(laserGeometry, laserMaterial);

        laserMesh.rotation.x = Math.PI / 2;
        laserMesh.position.z = this.length / 2;

        this.add(laserMesh);
    }

    /**
     * 
     * @param {THREE.Vector3} origin 
     * @param {THREE.Vector3} direction 
     */
    shoot(origin, direction) {
        this.position.copy(origin);
        this.lookAt(direction);

        this.scene.add(this);
    }

    animate(deltaTime) {
        this.position.z += this.speed * deltaTime;

        if(this.position.z > this.maxDistance) {
            this.scene.remove(this);
        }
    }
}
