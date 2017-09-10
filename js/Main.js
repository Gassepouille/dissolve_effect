var APP = APP || {};

APP.Main = class Main {
	constructor(domElement){
		this._container = domElement;
		// Renderer
		this._renderer  = new THREE.WebGLRenderer({
			antialias  : true,
			alpha    : true,
		});
		this._renderer.setClearColor(0x555555);
		
		this._container.appendChild( this._renderer.domElement );
		// Camera + scene
		this._camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
	        this.scene = new THREE.Scene();

		// Engine
		this._engine = new APP.Engine();

		// render scene
		this._engine.onUpdateFcts.push((delta,now)=>{
			this._renderer.render( this.scene, this._camera );
		})

		// Move camera around center
		this._engine.onUpdateFcts.push((delta,now)=>{
			let posX=3*Math.cos(now*0.5);
			let posZ=3*Math.sin(now*0.5);
			this._camera.position.set(posX,2,posZ);
			this._camera.lookAt(new THREE.Vector3(0,0,0));
		})

		// resize
		this.onWindowResize();
		window.addEventListener('resize', ()=>{
	                this.onWindowResize();
	        }, false)


		this._addObject();
		this._addLights();
	}
	start(){
		this._engine.start();
	}
	stop(){
		this._engine.stop();
	}
	_addObject(){
		let geometry = new THREE.BoxGeometry( 1, 1, 1 );
		// let material = new THREE.MeshPhongMaterial();
		// 
		// 
		let loader = new THREE.TextureLoader();
		// loader.load("textures/cube_texture2.png",(texture)=>{
		// 	// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		// 	// texture.repeat.set( 1, 1 );
		// 	material.map = texture;
		// 	material.needsUpdate = true;
		// })
		// loader.load("textures/cube_normal2.png",(normalMap)=>{
		// 	material.normalMap = normalMap;
		// 	material.normalScale = new THREE.Vector2( 2,2 );
		// 	material.needsUpdate = true;
		// })
		
		let texture = loader.load("textures/cube_texture2.png");
		let texture_dissolve = loader.load("textures/cube_dissolve.png");
		let uniforms = {
			texture: {type: 't', value: texture },
			texture_dissolve: {type: 't', value: texture_dissolve },
			time : {type: 'f', value: 0 },
		};
		
		this._engine.onUpdateFcts.push((delta,now)=>{
			uniforms.time.value = Math.abs(Math.sin(now*0.3));
		})
		let material = new THREE.ShaderMaterial({
			uniforms	: uniforms,
			vertexShader	: this._getShaders().vertexShader,
			fragmentShader	: this._getShaders().fragmentShader
		});
		let cube = new THREE.Mesh( geometry, material );
		this.scene.add( cube );
		
	}
	_getShaders(){
		let vertexShader = `
			varying vec2 vUv;
			
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
			}
		`;
		let fragmentShader = `
			uniform sampler2D texture;
			uniform sampler2D texture_dissolve;
			uniform float time;
			varying vec2 vUv;
			
			void main() {
				vec4 dissolveData = texture2D( texture_dissolve, vUv );
				float greyValue = dissolveData.r;
				float difference = greyValue - time;
				
				// gl_FragColor = vec4(1.0, 0.0,1.0,1.0);
				gl_FragColor = texture2D(texture, vUv);
				if(difference < 0.1){
					gl_FragColor.r = difference / 0.1;
					gl_FragColor.g = 0.0;
					gl_FragColor.b = 0.0;
				}
				if(difference < 0.01){
					discard;
				}
				
			}
		`;
		

		return {
			vertexShader:vertexShader,
			fragmentShader:fragmentShader,
		};
	}
	_addLights(){
		// add ambient light
		let ambientLight = new THREE.AmbientLight( 0x111111 );
		this.scene.add( ambientLight );
		// add a light in front
		let directionalLight	= new THREE.DirectionalLight('white', 1.5);
		directionalLight.position.set(0.5, 0.5, 2);
		this.scene.add( directionalLight );
		// add a light behind
		let secondDirectionalLight	= new THREE.DirectionalLight('white', 1);
		secondDirectionalLight.position.set(-0.5, -0.5, -2);
		this.scene.add( secondDirectionalLight );
	}
	onWindowResize(){
		let width  =  window.innerWidth;
		let height =  window.innerHeight;
		this._camera.aspect = width / height;
	        this._camera.updateProjectionMatrix();
		this._renderer.setSize( width, height );
	}


}
