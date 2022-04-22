let scene;

(function init(){
    document.addEventListener('DOMContentLoaded', function(){
        initTitle();
        initScene();
        initDice();
        initEventSource();
        initActions();
    });
})();

const initTitle = () => {

    const loader = new THREE.FontLoader();

    loader.load( './assets/Roboto_Regular.json', function ( font ) {

        const text = new THREE.TextGeometry( 'ROLL ONE', {
            font: font,
            size: 10,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 5
        } );

        const material = new THREE.MeshPhongMaterial( { color: 0xffff00, specular: 0xffff00, shininess: 50 } );

        const mesh = new THREE.Mesh(text, material);

        scene.add( mesh );
        mesh.position.set(-33, 22, 0);
    } );

};

const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF6DC);
    scene.fog = new THREE.Fog(0x000, 0, 750);
};

const initDice = () => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );

    const geometry = new THREE.BoxGeometry( 10, 10, 10 );
    const material = new THREE.ShaderMaterial({
        uniforms: {
            size: {
                value: new THREE.Vector3(geometry.parameters.width, geometry.parameters.height, geometry.parameters.depth).multiplyScalar(0.5)
            },
            thickness: {
                value: 0.01
            },
            smoothness: {
                value: 0.2
            }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    const cube = new THREE.Mesh( geometry, material );

    scene.add( cube );

    setInterval(() => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
        renderer.render( scene, camera );
    }, 1000/60);

}

const vertexShader = `
    varying vec3 vPos;
    void main()	{
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `;

const fragmentShader = `

    varying vec3 vPos;
    uniform vec3 size;
    uniform float thickness;
    uniform float smoothness;
   
    void main() {
			
      float a = smoothstep(thickness, thickness + smoothness, length(abs(vPos.xy) - size.xy));
      a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.yz) - size.yz));
      a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.xz) - size.xz));
      
      vec3 c = mix(vec3(1), vec3(0), a);
      
      gl_FragColor = vec4(c, 1.0);
    }
  `;

const initActions = () => {
    const rollButton = document.getElementById('roll-button');
    rollButton.addEventListener('click', () => {
        getRequest('/roll').then(response => {
            console.log('/roll', response);
        });
    });
};

const setDiceValue = (value) => {
    const diceValue = document.getElementById('dice');
    diceValue.innerText = value;
};

const initEventSource = () => {
    const eventSource = new EventSource('/');
    eventSource.addEventListener('roll', (event) => {
        const data = JSON.parse(event.data);
        setDiceValue(data.rolls[0]);
        console.log('roll', event);
    });
};

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
