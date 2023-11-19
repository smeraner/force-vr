import * as THREE from './three/three.module.js';
import { Capsule } from './three/addons/math/Capsule.js';

export class Actor extends THREE.Object3D {
    static debug = false;
    
    gravity = 0;
    health = 100;
    damageMultiplyer = 0.1;
    onFloor = false;

    colliderMesh = null;
    colliderHeight = 0.3;
    colliderRadius = 0.5;
    collider = new Capsule(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, this.colliderHeight, 0), this.colliderRadius);

    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();

    /**
     * 
     * @param {number} gravity 
     * @param {THREE.Scene} scene 
     */
    constructor(gravity, scene) {
        super();

        this.gravity = gravity;
        this.scene = scene;

        this.addEventListener('dead', this.die);

        //debug
        const capsuleGeometry = new THREE.CapsuleGeometry(this.collider.radius, this.collider.end.y - this.collider.start.y);
        const capsuleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        const colliderMesh = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
        colliderMesh.userData.obj = this;
        colliderMesh.position.copy(this.collider.start);
        this.colliderMesh = colliderMesh;
        this.scene.add(colliderMesh);

        this.colliderMesh.visible = Actor.debug;
    }

    /**
     * Handles the actor's movement.
     * @param {World} world 
     */
    worldCollitions(world) {
        const result = world.worldOctree.capsuleIntersect(this.collider);

        this.onFloor = false;

        if (result) {
            this.onFloor = result.normal.y > 0;

            if (!this.onFloor) {
                this.velocity.addScaledVector(result.normal, - result.normal.dot(this.velocity));
            }
            this.collider.translate(result.normal.multiplyScalar(result.depth));
            this.colliderMesh.position.copy(this.collider.start);
        }
    }

    /**
     * @param {number} deltaTime
     * @param {World} world
     */
    animate(deltaTime, world) {
        let damping = Math.exp(- 4 * deltaTime) - 1;
        if (!this.onFloor) {
            this.velocity.y -= this.gravity * deltaTime;
            damping *= 0.1; // small air resistance
        }
        this.velocity.addScaledVector(this.velocity, damping);

        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.collider.translate(deltaPosition);

        this.worldCollitions(world);

        this.position.copy(this.collider.start);
        this.position.y -= this.collider.radius;

        this.colliderMesh.visible = Actor.debug;
    }

    /**
     * Set the position of the actor.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.collider.start.set(x, y, z);
        this.collider.end.set(x, y + this.colliderHeight, z);
        //this.colliderHelper.position.copy(this.collider.start);
    }

    /**
     * Process inbound damage to the actor.
     * @param {number} amount
     */
    damage(amount) {
        if(this.health === 0) return;
        
        this.health -= amount * this.damageMultiplyer;
        if (this.health <= 0) {
            this.dispatchEvent({ type: 'dead' });
            this.health = 0;
        }
    }

    /**
     * Handles the actor's death.
     */
    die() {
        console.log(this, 'dead');
        this.colliderMesh.layers.disable(0);
    }

    /**
     * Dispose resources.
     */
    dispose() {
        this.scene.remove(this.colliderMesh);
    }
}
