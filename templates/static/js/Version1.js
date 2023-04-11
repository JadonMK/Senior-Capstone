const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75 /*(Field of View in deg.)*/, window.innerWidth / window.innerHeight /*Just keep these settings don't want image to look squished)*/, 0.1 /*(Near clipping distance)*/, 1000/*(Far clipping distance)*/ );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
/* For lower resolution:
    setSize(window.innerWidth/2, window.innerHeight/2, false)
*/
document.body.appendChild( renderer.domElement );

//https://medium.com/nerd-for-tech/getting-started-with-your-first-three-js-project-part-two-the-build-3fd9a2f21418
renderer.setClearColor("#233143");
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);  //X == red, Y == green, Z == blue

//First central sphere
const geometry = new THREE.SphereGeometry(1, 32, 16);
const material = new THREE.MeshLambertMaterial( { color: 0x58286d /*Purple*/ } );
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

camera.position.z = 10;

const light = new THREE.PointLight(0xffffff, 10, 100);
light.position.set(1,1,1);
scene.add(light);

//Math Constants
let count = 1;
const G = 6.6743e-11; //Gravitational Constant
const M = 17000000; //Massive body mass (this is what my particle orbits)

//New Massive Body
const MB = new massiveBody(8, 2, -0.02, 0, 0, 0);

//Orbiting Body Geometry
const geometry1 = new THREE.SphereGeometry(0.2, 32, 16);
const material1 = new THREE.MeshLambertMaterial( { color: 0x58286d /*Purple*/ } );
const sphere1 = new THREE.Mesh( geometry1, material1 );
scene.add( sphere1 );

MB.JSONCalculator();

function animate() {
    count++;
    
    if(count > 0){
        MB.calcParams()
        sphere1.position.x = MB.PositionX;
        sphere1.position.y = MB.PositionY;

        count = 0;
    }

    sphere.rotation.x -= 0.05;
    sphere.rotation.y -= 0.05;
    requestAnimationFrame( animate );
    renderer.render ( scene, camera );
}

animate();