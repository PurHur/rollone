let scene;
let dice;

(function init() {
    document.addEventListener('DOMContentLoaded', function () {
        initTitle();
        initScene();
        initDice();
        initEventSource();
        initActions();
        fetchJournal();
    });
})();


const initTitle = () => {
    const loader = new THREE.FontLoader();

    loader.load('./assets/Roboto_Regular.json', function (font) {
        const text = new THREE.TextGeometry('ROLL ONE', {
            font: font,
            size: window.matchMedia('(min-width: 768px)').matches ? 10 : 5,
            height: window.matchMedia('(min-width: 768px)').matches ? 0.75 : 0.25,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 5
        });

        const material = new THREE.MeshPhongMaterial({color: 0x000, specular: 0x000, shininess: 50});
        const mesh = new THREE.Mesh(text, material);

        scene.add(mesh);

        let xPos = window.matchMedia('(min-width: 768px)').matches ? -33 : -20;

        mesh.position.set(xPos, 22, 0);
    });
};

const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF6DC);
    scene.fog = new THREE.Fog(0x000, 0, 750);

    const light = new THREE.AmbientLight({color: 0x404040, intensity: 22}); // soft white light
    scene.add(light);
};

var diceObjects;
const initDice = () => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // Setup your cannonjs world
    const world = new CANNON.World();
    // ...
    DiceManager.setWorld(world);
    const dices = [4, 6, 8, 10, 12, 20];
    diceObjects = {};
    let count = 0;

    dices.forEach(dice => {
        let diceObj;
        let size = window.matchMedia('(min-width: 768px)').matches ? 10 : 5
        let xPos = window.matchMedia('(min-width: 768px)').matches ? (-30 + (count%3) * 31) : (-10 + (count%3) * 10);
        let yPos = window.matchMedia('(min-width: 768px)').matches ? (- Math.floor(count/3) * 30) : (8 - Math.floor(count/3) * 33);
        const diceManager = new DiceManagerClass();
        diceManager.setWorld(world);
        eval( "diceObj = new DiceD" + dice +"({size: size});");

        diceObj.diceManager = diceManager;
        // If you want to place the mesh somewhere else, you have to update the body
        diceObj.getObject().position.x = xPos;
        diceObj.getObject().position.y = yPos;
        diceObj.getObject().position.z = 0;
        diceObj.getObject().rotation.y = -120 * Math.PI / 180;
        diceObj.getObject().rotation.x = 45 * Math.PI / 180;
        diceObj.updateBodyFromMesh();
        scene.add(diceObj.getObject());

        diceObjects[dice] = diceObj;
        count++;
    });

    // Set the value of the side, which will be upside after the dice lands
    Object.keys(diceObjects).forEach(sides => {
        function prepare() {
            diceObjects[sides].diceManager.prepareValues([{dice: diceObjects[sides], value: dice}]);
        }
    });

    let rotationDirection = 'clockwise';

    //Animate everything
    function animate() {
        world.step(1.0 / 60.0);
        world.step(1 / 60);
        Object.keys(diceObjects).forEach(dice => {
            const angle = diceObjects[dice].getObject().rotation.y;

            if(rotationDirection === 'counterclockwise'){
                diceObjects[dice].getObject().rotation.y += 0.01;
            } else{
                diceObjects[dice].getObject().rotation.y -= 0.01;
            }

            if(1.6 > angle && angle > 1.5){
                rotationDirection = 'clockwise';

            } else if(-1.5 > angle && angle > -1.6){
                rotationDirection = 'counterclockwise';
            }

            diceObjects[dice].updateBodyFromMesh();
            diceObjects[dice].updateMeshFromBody(); // Call this after updating the physics world for rearranging the mesh according to the body
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


const fetchJournal = (value) => {
    getRequest('/journal').then(response => {
        const entries = JSON.parse(response);
        if (entries) {
            document.getElementById("journal").innerHTML = "";

            entries.forEach(entry => {
                try {
                    var data = JSON.parse(entry.data);
                    document.getElementById("journal").innerHTML += '<div class="journal-entry">'+data.roller+' würfelt mit einem d'+data.sides+' '+data.rolls.join(",")+'</div>';
                    fadeOut(".journal-entry:not(.active)",1000)

                } catch (e) {}
            });
        }
    });
};


const rollDice = (value) => {
    getRequest('/roll?sides='+value).then(response => {
        console.log('/roll', value,response);
    });
};

const initActions = () =>{
    const d4 = document.getElementById('d4-button');
    d4.addEventListener('click', () => {
        rollDice(4);
    });

    const d6 = document.getElementById('d6-button');
    d6.addEventListener('click', () => {
        rollDice(6);
    });

    const d8 = document.getElementById('d8-button');
    d8.addEventListener('click', () => {
        rollDice(8);
    });

    const d10 = document.getElementById('d10-button');
    d10.addEventListener('click', () => {
        rollDice(10);
    });

    const d12 = document.getElementById('d12-button');
    d12.addEventListener('click', () => {
        rollDice(12);
    });

    const d20 = document.getElementById('d20-button');
    d20.addEventListener('click', () => {
        rollDice(20);
    });
};

const setDiceValue = (value, diceObj) => {
    diceObj.diceManager.prepareValues([{dice: diceObj, value: value}]);
};

function setUsernameCoookie(name) {
    document.cookie = 'username=' + name + '; expires=0; path=/';
}

const initEventSource = () => {
    const eventSource = new EventSource('/');
    eventSource.addEventListener('roll', (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        setDiceValue(data.rolls[0], diceObjects[data.sides]);
        console.log('roll', event);

        document.getElementById("journal").innerHTML += '<div class="journal-entry">'+data.roller+' würfelt mit einem d'+data.sides+' '+data.rolls.join(",")+'</div>';

        fadeOut(".journal-entry:not(.active)",1000)
    });
    eventSource.addEventListener('name', (event) => {
        const name = event.data;
        setUsernameCoookie(name);
        document.getElementById("username").value = name;
    });
};

function fadeOut(selector, timeInterval, callback = null) {

    var fadeTarget = document.querySelector(selector);

    fadeTarget.classList.add('active');

    timeInterval = 5000;

    let time = timeInterval / 1000;
    fadeTarget.style.transition = time + 's';
    fadeTarget.style.opacity = 1;
    var fadeEffect = setInterval(function() {

        if (fadeTarget.style.opacity <= 0)
        {
            clearInterval(fadeEffect);
            if (typeof (callback) === 'function') {
                callback();
            }
        } else {
            fadeTarget.style.opacity -= 0.01;
        }
    }, timeInterval);
}

const getRequest = (url) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(xhr.statusText));
            }
        };
        xhr.onerror = () => {
            reject(new Error('Network Error'));
        };
        xhr.send();
    });
};

const queueCall = cb => setTimeout(() => cb(), 0);

'use strict';

class DiceManagerClass {
    constructor() {
        this.world = null;
    }

    setWorld(world) {
        this.world = world;

        this.diceBodyMaterial = new CANNON.Material();
        this.floorBodyMaterial = new CANNON.Material();
        this.barrierBodyMaterial = new CANNON.Material();

        world.addContactMaterial(
            new CANNON.ContactMaterial(this.floorBodyMaterial, this.diceBodyMaterial, {
                friction: 0.01,
                restitution: 0.5
            })
        );
        world.addContactMaterial(
            new CANNON.ContactMaterial(this.barrierBodyMaterial, this.diceBodyMaterial, {friction: 0, restitution: 1.0})
        );
        world.addContactMaterial(
            new CANNON.ContactMaterial(this.diceBodyMaterial, this.diceBodyMaterial, {friction: 0, restitution: 0.5})
        );
    }

    /**
     *
     * @param {array} diceValues
     * @param {DiceObject} [diceValues.dice]
     * @param {number} [diceValues.value]
     *
     */
    prepareValues(diceValues) {
        if (this.throwRunning) throw new Error('Cannot start another throw. Please wait, till the current throw is finished.');

        for (let i = 0; i < diceValues.length; i++) {
            if (diceValues[i].value < 1 || diceValues[i].dice.values < diceValues[i].value) {
                throw new Error('Cannot throw die to value ' + diceValues[i].value + ', because it has only ' + diceValues[i].dice.values + ' sides.');
            }
        }

        this.throwRunning = true;

        for (let i = 0; i < diceValues.length; i++) {
            diceValues[i].dice.simulationRunning = true;
            diceValues[i].vectors = diceValues[i].dice.getCurrentVectors();
            diceValues[i].stableCount = 0;
        }

        let check = () => {
            let allStable = true;
            for (let i = 0; i < diceValues.length; i++) {
                if (diceValues[i].dice.isFinished()) {
                    diceValues[i].stableCount++;
                } else {
                    diceValues[i].stableCount = 0;
                }

                if (diceValues[i].stableCount < 50) {
                    allStable = false;
                }
            }

            if (allStable) {
                console.log("all stable");
                DiceManager.world.removeEventListener('postStep', check);

                for (let i = 0; i < diceValues.length; i++) {
                    diceValues[i].dice.shiftUpperValue(diceValues[i].value);
                    diceValues[i].dice.resetBody();
                    diceValues[i].dice.setVectors(diceValues[i].vectors);
                    diceValues[i].dice.simulationRunning = false;
                }

                this.throwRunning = false;
            } else {
                DiceManager.world.step(DiceManager.world.dt);
            }
        };

        this.world.addEventListener('postStep', check);
    }
}

class DiceObject {
    /**
     * @constructor
     * @param {object} options
     * @param {Number} [options.size = 100]
     * @param {Number} [options.fontColor = '#000000']
     * @param {Number} [options.backColor = '#ffffff']
     */
    constructor(options) {
        options = this.setDefaults(options, {
            size: 100,
            fontColor: '#000000',
            backColor: '#ffffff'
        });

        this.object = null;
        this.size = options.size;
        this.invertUpside = false;

        this.materialOptions = {
            specular: 0x172022,
            color: 0xf0f0f0,
            shininess: 40,
            flatShading: true,
            //shading: THREE.FlatShading,
        };
        this.labelColor = options.fontColor;
        this.diceColor = options.backColor;
    }

    setDefaults(options, defaults) {
        options = options || {};

        for (let key in defaults) {
            if (!defaults.hasOwnProperty(key)) continue;

            if (!(key in options)) {
                options[key] = defaults[key];
            }
        }

        return options;
    }

    emulateThrow(callback) {
        let stableCount = 0;

        let check = () => {
            if (this.isFinished()) {
                stableCount++;

                if (stableCount === 50) {
                    DiceManager.world.removeEventListener('postStep', check);
                    callback(this.getUpsideValue());
                }
            } else {
                stableCount = 0;
            }

            DiceManager.world.step(DiceManager.world.dt);
        };

        DiceManager.world.addEventListener('postStep', check);
    }

    isFinished() {
        let threshold = 1;

        let angularVelocity = this.object.body.angularVelocity;
        let velocity = this.object.body.velocity;

        return (Math.abs(angularVelocity.x) < threshold && Math.abs(angularVelocity.y) < threshold && Math.abs(angularVelocity.z) < threshold &&
            Math.abs(velocity.x) < threshold && Math.abs(velocity.y) < threshold && Math.abs(velocity.z) < threshold);
    }

    getUpsideValue() {
        let vector = new THREE.Vector3(0, this.invertUpside ? -1 : 1);
        let closest_face;
        let closest_angle = Math.PI * 2;

        let normals = this.object.geometry.getAttribute('normal').array;
        for (let i = 0; i < this.object.geometry.groups.length; ++i) {
            let face = this.object.geometry.groups[i];
            if (face.materialIndex === 0) continue;

            //Each group consists in 3 vertices of 3 elements (x, y, z) so the offset between faces in the Float32BufferAttribute is 9
            let startVertex = i * 9;
            let normal = new THREE.Vector3(normals[startVertex], normals[startVertex + 1], normals[startVertex + 2]);
            let angle = normal.clone().applyQuaternion(this.object.body.quaternion).angleTo(vector);
            if (angle < closest_angle) {
                closest_angle = angle;
                closest_face = face;
            }
        }

        return closest_face.materialIndex - 1;
    }

    getCurrentVectors() {
        return {
            position: this.object.body.position.clone(),
            quaternion: this.object.body.quaternion.clone(),
            velocity: this.object.body.velocity.clone(),
            angularVelocity: this.object.body.angularVelocity.clone()
        };
    }

    setVectors(vectors) {
        this.object.body.position = vectors.position;
        this.object.body.quaternion = vectors.quaternion;
        this.object.body.velocity = vectors.velocity;
        this.object.body.angularVelocity = vectors.angularVelocity;
    }

    shiftUpperValue(toValue) {
        let geometry = this.object.geometry.clone();

        let fromValue = this.getUpsideValue();
        for (let i = 0, l = geometry.groups.length; i < l; ++i) {
            let materialIndex = geometry.groups[i].materialIndex;
            if (materialIndex === 0) continue;

            materialIndex += toValue - fromValue - 1;
            while (materialIndex > this.values) materialIndex -= this.values;
            while (materialIndex < 1) materialIndex += this.values;

            geometry.groups[i].materialIndex = materialIndex + 1;
        }

        this.updateMaterialsForValue(toValue - fromValue);

        this.object.geometry = geometry;
    }

    getChamferGeometry(vectors, faces, chamfer) {
        let chamfer_vectors = [], chamfer_faces = [], corner_faces = new Array(vectors.length);
        for (let i = 0; i < vectors.length; ++i) corner_faces[i] = [];
        for (let i = 0; i < faces.length; ++i) {
            let ii = faces[i], fl = ii.length - 1;
            let center_point = new THREE.Vector3();
            let face = new Array(fl);
            for (let j = 0; j < fl; ++j) {
                let vv = vectors[ii[j]].clone();
                center_point.add(vv);
                corner_faces[ii[j]].push(face[j] = chamfer_vectors.push(vv) - 1);
            }
            center_point.divideScalar(fl);
            for (let j = 0; j < fl; ++j) {
                let vv = chamfer_vectors[face[j]];
                vv.subVectors(vv, center_point).multiplyScalar(chamfer).addVectors(vv, center_point);
            }
            face.push(ii[fl]);
            chamfer_faces.push(face);
        }
        for (let i = 0; i < faces.length - 1; ++i) {
            for (let j = i + 1; j < faces.length; ++j) {
                let pairs = [], lastm = -1;
                for (let m = 0; m < faces[i].length - 1; ++m) {
                    let n = faces[j].indexOf(faces[i][m]);
                    if (n >= 0 && n < faces[j].length - 1) {
                        if (lastm >= 0 && m !== lastm + 1) pairs.unshift([i, m], [j, n]);
                        else pairs.push([i, m], [j, n]);
                        lastm = m;
                    }
                }
                if (pairs.length !== 4) continue;
                chamfer_faces.push([chamfer_faces[pairs[0][0]][pairs[0][1]],
                    chamfer_faces[pairs[1][0]][pairs[1][1]],
                    chamfer_faces[pairs[3][0]][pairs[3][1]],
                    chamfer_faces[pairs[2][0]][pairs[2][1]], -1]);
            }
        }
        for (let i = 0; i < corner_faces.length; ++i) {
            let cf = corner_faces[i], face = [cf[0]], count = cf.length - 1;
            while (count) {
                for (let m = faces.length; m < chamfer_faces.length; ++m) {
                    let index = chamfer_faces[m].indexOf(face[face.length - 1]);
                    if (index >= 0 && index < 4) {
                        if (--index === -1) index = 3;
                        let next_vertex = chamfer_faces[m][index];
                        if (cf.indexOf(next_vertex) >= 0) {
                            face.push(next_vertex);
                            break;
                        }
                    }
                }
                --count;
            }
            face.push(-1);
            chamfer_faces.push(face);
        }
        return {vectors: chamfer_vectors, faces: chamfer_faces};
    }

    makeGeometry(vertices, faces, radius, tab, af) {
        let geom = new THREE.BufferGeometry();

        for (let i = 0; i < vertices.length; ++i) {
            vertices[i] = vertices[i].multiplyScalar(radius);
        }

        let positions = [];
        const normals = [];
        const uvs = [];

        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();
        let materialIndex;
        let faceFirstVertexIndex = 0;

        for (let i = 0; i < faces.length; ++i) {
            let ii = faces[i], fl = ii.length - 1;
            let aa = Math.PI * 2 / fl;
            materialIndex = ii[fl] + 1;
            for (let j = 0; j < fl - 2; ++j) {

                //Vertices
                positions.push(...vertices[ii[0]].toArray());
                positions.push(...vertices[ii[j + 1]].toArray());
                positions.push(...vertices[ii[j + 2]].toArray());

                // Flat face normals
                cb.subVectors(vertices[ii[j + 2]], vertices[ii[j + 1]]);
                ab.subVectors(vertices[ii[0]], vertices[ii[j + 1]]);
                cb.cross(ab);
                cb.normalize();

                // Vertex Normals
                normals.push(...cb.toArray());
                normals.push(...cb.toArray());
                normals.push(...cb.toArray());

                //UVs
                uvs.push((Math.cos(af) + 1 + tab) / 2 / (1 + tab), (Math.sin(af) + 1 + tab) / 2 / (1 + tab));
                uvs.push((Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab), (Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab));
                uvs.push((Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab), (Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab));

            }

            //Set Group for face materials.
            let numOfVertices = (fl - 2) * 3;
            for (let i = 0; i < numOfVertices / 3; i++) {
                geom.addGroup(faceFirstVertexIndex, 3, materialIndex);
                faceFirstVertexIndex += 3;
            }

        }


        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
        return geom;
    }

    createShape(vertices, faces, radius) {
        let cv = new Array(vertices.length), cf = new Array(faces.length);
        for (let i = 0; i < vertices.length; ++i) {
            let v = vertices[i];
            cv[i] = new CANNON.Vec3(v.x * radius, v.y * radius, v.z * radius);
        }
        for (let i = 0; i < faces.length; ++i) {
            cf[i] = faces[i].slice(0, faces[i].length - 1);
        }
        return new CANNON.ConvexPolyhedron(cv, cf);
    }

    getGeometry() {
        let radius = this.size * this.scaleFactor;

        let vectors = new Array(this.vertices.length);
        for (let i = 0; i < this.vertices.length; ++i) {
            vectors[i] = (new THREE.Vector3).fromArray(this.vertices[i]).normalize();
        }

        let chamferGeometry = this.getChamferGeometry(vectors, this.faces, this.chamfer);
        let geometry = this.makeGeometry(chamferGeometry.vectors, chamferGeometry.faces, radius, this.tab, this.af);
        geometry.cannon_shape = this.createShape(vectors, this.faces, radius);

        return geometry;
    }

    calculateTextureSize(approx) {
        return Math.max(128, Math.pow(2, Math.floor(Math.log(approx) / Math.log(2))));
    }

    createTextTexture(text, color, backColor) {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        let ts = this.calculateTextureSize(this.size / 2 + this.size * this.textMargin) * 2;
        canvas.width = canvas.height = ts;
        context.font = ts / (1 + 2 * this.textMargin) + "pt Arial";
        context.fillStyle = backColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    getMaterials() {
        let materials = [];
        for (let i = 0; i < this.faceTexts.length; ++i) {
            let texture = null;
            if (this.customTextTextureFunction) {
                texture = this.customTextTextureFunction(this.faceTexts[i], this.labelColor, this.diceColor);
            } else {
                texture = this.createTextTexture(this.faceTexts[i], this.labelColor, this.diceColor);
            }

            materials.push(new THREE.MeshPhongMaterial(Object.assign({}, this.materialOptions, {map: texture})));
        }
        return materials;
    }

    getObject() {
        return this.object;
    }

    create() {
        if (!DiceManager.world) throw new Error('You must call DiceManager.setWorld(world) first.');
        this.object = new THREE.Mesh(this.getGeometry(), this.getMaterials());

        this.object.reveiceShadow = true;
        this.object.castShadow = true;
        this.object.diceObject = this;
        this.object.body = new CANNON.Body({
            mass: this.mass,
            shape: this.object.geometry.cannon_shape,
            material: DiceManager.diceBodyMaterial
        });
        this.object.body.linearDamping = 0.1;
        this.object.body.angularDamping = 0.1;
        DiceManager.world.add(this.object.body);

        return this.object;
    }

    updateMeshFromBody() {
        if (!this.simulationRunning) {
            this.object.position.copy(this.object.body.position);
            this.object.quaternion.copy(this.object.body.quaternion);
        }
    }

    updateBodyFromMesh() {
        this.object.body.position.copy(this.object.position);
        this.object.body.quaternion.copy(this.object.quaternion);
    }

    resetBody() {
        this.object.body.vlambda = new CANNON.Vec3();
        //this.object.body.collisionResponse = true;
        this.object.body.position = new CANNON.Vec3();
        this.object.body.previousPosition = new CANNON.Vec3();
        this.object.body.initPosition = new CANNON.Vec3();
        this.object.body.velocity = new CANNON.Vec3();
        this.object.body.initVelocity = new CANNON.Vec3();
        this.object.body.force = new CANNON.Vec3();
        //this.object.body.sleepState = 0;
        //this.object.body.timeLastSleepy = 0;
        //this.object.body._wakeUpAfterNarrowphase = false;
        this.object.body.torque = new CANNON.Vec3();
        this.object.body.quaternion = new CANNON.Quaternion();
        this.object.body.initQuaternion = new CANNON.Quaternion();
        this.object.body.angularVelocity = new CANNON.Vec3();
        this.object.body.initAngularVelocity = new CANNON.Vec3();
        this.object.body.interpolatedPosition = new CANNON.Vec3();
        this.object.body.interpolatedQuaternion = new CANNON.Quaternion();
        this.object.body.inertia = new CANNON.Vec3();
        this.object.body.invInertia = new CANNON.Vec3();
        this.object.body.invInertiaWorld = new CANNON.Mat3();
        //this.object.body.invMassSolve = 0;
        this.object.body.invInertiaSolve = new CANNON.Vec3();
        this.object.body.invInertiaWorldSolve = new CANNON.Mat3();
        //this.object.body.aabb = new CANNON.AABB();
        //this.object.body.aabbNeedsUpdate = true;
        this.object.body.wlambda = new CANNON.Vec3();

        this.object.body.updateMassProperties();
    }

    updateMaterialsForValue(diceValue) {
    }
}

class DiceD4 extends DiceObject {
    constructor(options) {
        super(options);

        this.tab = -0.1;
        this.af = Math.PI * 7 / 6;
        this.chamfer = 0.96;
        this.vertices = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
        this.faces = [[1, 0, 2, 1], [0, 1, 3, 2], [0, 3, 2, 3], [1, 2, 3, 4]];
        this.scaleFactor = 1.2;
        this.values = 4;
        this.d4FaceTexts = [
            [[], [0, 0, 0], [2, 4, 3], [1, 3, 4], [2, 1, 4], [1, 2, 3]],
            [[], [0, 0, 0], [2, 3, 4], [3, 1, 4], [2, 4, 1], [3, 2, 1]],
            [[], [0, 0, 0], [4, 3, 2], [3, 4, 1], [4, 2, 1], [3, 1, 2]],
            [[], [0, 0, 0], [4, 2, 3], [1, 4, 3], [4, 1, 2], [1, 3, 2]]
        ];
        this.faceTexts = this.d4FaceTexts[0];
        this.updateMaterialsForValue = function (diceValue) {
            if (diceValue < 0) diceValue += 4;
            this.faceTexts = this.d4FaceTexts[diceValue];
            this.object.material = this.getMaterials();
        };
        this.customTextTextureFunction = function (text, color, backColor) {
            let canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");
            let ts = this.calculateTextureSize(this.size / 2 + this.size * 2) * 2;
            canvas.width = canvas.height = ts;
            context.font = ts / 5 + "pt Arial";
            context.fillStyle = backColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = color;
            for (let i in text) {
                context.fillText(text[i], canvas.width / 2,
                    canvas.height / 2 - ts * 0.3);
                context.translate(canvas.width / 2, canvas.height / 2);
                context.rotate(Math.PI * 2 / 3);
                context.translate(-canvas.width / 2, -canvas.height / 2);
            }
            let texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        };
        this.mass = 300;
        this.inertia = 5;
        this.invertUpside = true;

        this.create();
    }
}

class DiceD6 extends DiceObject {
    constructor(options) {
        super(options);

        this.tab = 0.1;
        this.af = Math.PI / 4;
        this.chamfer = 0.96;
        this.vertices = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
        this.faces = [[0, 3, 2, 1, 1], [1, 2, 6, 5, 2], [0, 1, 5, 4, 3],
            [3, 7, 6, 2, 4], [0, 4, 7, 3, 5], [4, 5, 6, 7, 6]];
        this.scaleFactor = 0.9;
        this.values = 6;
        this.faceTexts = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        this.textMargin = 1.0;
        this.mass = 300;
        this.inertia = 13;

        this.create();
    }
}

class DiceD8 extends DiceObject {
    constructor(options) {
        super(options);

        this.tab = 0;
        this.af = -Math.PI / 4 / 2;
        this.chamfer = 0.965;
        this.vertices = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
        this.faces = [[0, 2, 4, 1], [0, 4, 3, 2], [0, 3, 5, 3], [0, 5, 2, 4], [1, 3, 4, 5],
            [1, 4, 2, 6], [1, 2, 5, 7], [1, 5, 3, 8]];
        this.scaleFactor = 1;
        this.values = 8;
        this.faceTexts = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        this.textMargin = 1.2;
        this.mass = 340;
        this.inertia = 10;

        this.create();
    }
}

class DiceD10 extends DiceObject {

    constructor(options) {
        super(options);

        this.tab = 0;
        this.af = Math.PI * 6 / 5;
        this.chamfer = 0.945;
        this.vertices = [];
        this.faces = [[5, 7, 11, 0], [4, 2, 10, 1], [1, 3, 11, 2], [0, 8, 10, 3], [7, 9, 11, 4],
            [8, 6, 10, 5], [9, 1, 11, 6], [2, 0, 10, 7], [3, 5, 11, 8], [6, 4, 10, 9],
            [1, 0, 2, -1], [1, 2, 3, -1], [3, 2, 4, -1], [3, 4, 5, -1], [5, 4, 6, -1],
            [5, 6, 7, -1], [7, 6, 8, -1], [7, 8, 9, -1], [9, 8, 0, -1], [9, 0, 1, -1]];

        for (let i = 0, b = 0; i < 10; ++i, b += Math.PI * 2 / 10) {
            this.vertices.push([Math.cos(b), Math.sin(b), 0.105 * (i % 2 ? 1 : -1)]);
        }
        this.vertices.push([0, 0, -1]);
        this.vertices.push([0, 0, 1]);

        this.scaleFactor = 0.9;
        this.values = 10;
        this.faceTexts = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        this.textMargin = 1.0;
        this.mass = 350;
        this.inertia = 9;

        this.create();
    }
}

class DiceD12 extends DiceObject {
    constructor(options) {
        super(options);

        let p = (1 + Math.sqrt(5)) / 2;
        let q = 1 / p;

        this.tab = 0.2;
        this.af = -Math.PI / 4 / 2;
        this.chamfer = 0.968;
        this.vertices = [[0, q, p], [0, q, -p], [0, -q, p], [0, -q, -p], [p, 0, q],
            [p, 0, -q], [-p, 0, q], [-p, 0, -q], [q, p, 0], [q, -p, 0], [-q, p, 0],
            [-q, -p, 0], [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1],
            [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]];
        this.faces = [[2, 14, 4, 12, 0, 1], [15, 9, 11, 19, 3, 2], [16, 10, 17, 7, 6, 3], [6, 7, 19, 11, 18, 4],
            [6, 18, 2, 0, 16, 5], [18, 11, 9, 14, 2, 6], [1, 17, 10, 8, 13, 7], [1, 13, 5, 15, 3, 8],
            [13, 8, 12, 4, 5, 9], [5, 4, 14, 9, 15, 10], [0, 12, 8, 10, 16, 11], [3, 19, 7, 17, 1, 12]];
        this.scaleFactor = 0.9;
        this.values = 12;
        this.faceTexts = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        this.textMargin = 1.0;
        this.mass = 350;
        this.inertia = 8;

        this.create();
    }
}

class DiceD20 extends DiceObject {
    constructor(options) {
        super(options);

        let t = (1 + Math.sqrt(5)) / 2;

        this.tab = -0.2;
        this.af = -Math.PI / 4 / 2;
        this.chamfer = 0.955;
        this.vertices = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
            [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
            [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
        this.faces = [[0, 11, 5, 1], [0, 5, 1, 2], [0, 1, 7, 3], [0, 7, 10, 4], [0, 10, 11, 5],
            [1, 5, 9, 6], [5, 11, 4, 7], [11, 10, 2, 8], [10, 7, 6, 9], [7, 1, 8, 10],
            [3, 9, 4, 11], [3, 4, 2, 12], [3, 2, 6, 13], [3, 6, 8, 14], [3, 8, 9, 15],
            [4, 9, 5, 16], [2, 4, 11, 17], [6, 2, 10, 18], [8, 6, 7, 19], [9, 8, 1, 20]];
        this.scaleFactor = 1;
        this.values = 20;
        this.faceTexts = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8',
            '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
        this.textMargin = 1.0;
        this.mass = 400;
        this.inertia = 6;

        this.create();
    }
}

//---------------------------------------------//

const DiceManager = new DiceManagerClass();
