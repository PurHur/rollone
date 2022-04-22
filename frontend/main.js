(function init(){
    // Initialize the app
    document.addEventListener('DOMContentLoaded', function(){
        initDice();
    });
})();

const initDice = () => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );

    const geometry = new THREE.BoxGeometry( 10, 10, 10 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ffaa, wireframe: true} );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    setInterval(() => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
        renderer.render( scene, camera );
    }, 1000/60);

}