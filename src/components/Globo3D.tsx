import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ContinentInfo {
  name: string;
  area: string;
  population: string;
  funFacts: string[];
  color: string;
  icon: string;
  position: THREE.Vector3;
  animals: string[];
}

export default function Globo3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const sunRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [selectedContinent, setSelectedContinent] = useState<ContinentInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const [cloudsEnabled, setCloudsEnabled] = useState(true);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState('');

  const continents: ContinentInfo[] = [
    { 
      name: 'África', 
      area: '30.3 millones km²', 
      population: '1.400 millones',
      funFacts: [
        '¡Es el continente con más países! Tiene 54 países diferentes.',
        'Aquí viven los animales más grandes: elefantes y jirafas.',
        'El río Nilo es el más largo del mundo.',
        '¡El desierto del Sahara es enorme! Es como 10 países juntos.'
      ],
      color: '#FF6B35',
      icon: '🦁',
      position: new THREE.Vector3(0.5, 0.2, 0.8),
      animals: ['León', 'Elefante', 'Jirafa', 'Hipopótamo', 'Leopardo']
    },
    { 
      name: 'Asia', 
      area: '44.6 millones km²', 
      population: '4.600 millones',
      funFacts: [
        '¡Es el continente más grande del mundo!',
        'Aquí está el monte Everest, la montaña más alta.',
        'Viven pandas gigantes que comen bambú.',
        '¡China e India son los países con más gente!'
      ],
      color: '#4ECDC4',
      icon: '🐼',
      position: new THREE.Vector3(0.8, 0.3, 0.5),
      animals: ['Panda', 'Tigre', 'Elefante Asiático', 'Mono', 'Camello']
    },
    { 
      name: 'Europa', 
      area: '10.2 millones km²', 
      population: '750 millones',
      funFacts: [
        '¡Tiene países muy pequeños como el Vaticano!',
        'Aquí inventaron la pizza y el chocolate.',
        'Muchos castillos de princesas y caballeros.',
        '¡En invierno hace mucho frío y nieva!'
      ],
      color: '#45B7D1',
      icon: '🏰',
      position: new THREE.Vector3(0.3, 0.5, 0.8),
      animals: ['Oso Pardo', 'Zorro', 'Lobo', 'Ciervo', 'Águila']
    },
    { 
      name: 'América del Norte', 
      area: '24.7 millones km²', 
      population: '580 millones',
      funFacts: [
        '¡Tiene el país más grande del mundo: Canadá!',
        'Aquí viven los osos grizzly enormes.',
        'Las cataratas del Niágara son super grandes.',
        '¡En México hay pirámides antiguas!'
      ],
      color: '#96CEB4',
      icon: '🐻',
      position: new THREE.Vector3(-0.8, 0.4, 0.4),
      animals: ['Oso Grizzly', 'Águila Calva', 'Lobo', 'Alce', 'Bisonte']
    },
    { 
      name: 'América del Sur', 
      area: '17.8 millones km²', 
      population: '430 millones',
      funFacts: [
        '¡Tiene la selva más grande: el Amazonas!',
        'Las llamas y alpacas viven aquí.',
        'El río Amazonas es super ancho.',
        '¡Hay playas muy bonitas y montañas altas!'
      ],
      color: '#FFEAA7',
      icon: '🦙',
      position: new THREE.Vector3(-0.6, -0.3, 0.7),
      animals: ['Llama', 'Mono Araña', 'Guacamayo', 'Jaguar', 'Caimán']
    },
    { 
      name: 'Oceanía', 
      area: '8.6 millones km²', 
      population: '45 millones',
      funFacts: [
        '¡Australia es un país y un continente!',
        'Los canguros saltan muy alto.',
        'La Gran Barrera de Coral es de colores.',
        '¡Los koalas duermen 20 horas al día!'
      ],
      color: '#DDA0DD',
      icon: '🦘',
      position: new THREE.Vector3(0.7, -0.4, -0.6),
      animals: ['Canguro', 'Koala', 'Cocodrilo Marino', 'Ornitorrinco', 'Casuario']
    },
    { 
      name: 'Antártida', 
      area: '14.2 millones km²', 
      population: '4.000 personas',
      funFacts: [
        '¡Es el continente más frío del mundo!',
        'Los pingüinos son los dueños de aquí.',
        'Está cubierto de hielo todo el año.',
        '¡En invierno no sale el sol por meses!'
      ],
      color: '#000000ff',
      icon: '🐧',
      position: new THREE.Vector3(0, -1, 0),
      animals: ['Pingüino Emperador', 'Ballena', 'Foca', 'Krill', 'Petrel']
    }
  ];

  // Texturas realistas de la NASA
  const loadRealisticTextures = () => {
    const textureLoader = new THREE.TextureLoader();

    const dayTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      () => {
        // Textura diurna cargada
        setTextureLoaded(true);
      },
      undefined,
      () => {
        // Fallback si falla la anterior
        const fallback = textureLoader.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_4096.jpg',
          () => setTextureLoaded(true)
        );
        return fallback;
      }
    );

    const cloudsTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
    );

    const bumpTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
    );

    const specularTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
    );

    return {
      dayTexture,
      cloudsTexture,
      bumpTexture,
      specularTexture
    };
  };

  const toggleClouds = () => {
    if (cloudsRef.current) {
      cloudsRef.current.visible = !cloudsRef.current.visible;
      setCloudsEnabled(cloudsRef.current.visible);
    }
  };

  const generateQuiz = (continent: ContinentInfo) => {
    const questionTypes = [
      {
        type: 'animal',
        question: `¿Qué animal característico vive en ${continent.name}?`,
        correct: continent.animals[0],
        options: generateAnimalOptions(continent.animals[0])
      },
      {
        type: 'area',
        question: `¿Cuál es el área aproximada de ${continent.name}?`,
        correct: continent.area,
        options: generateAreaOptions(continent.area)
      },
      {
        type: 'fact',
        question: `¿Cuál es un dato curioso sobre ${continent.name}?`,
        correct: continent.funFacts[0],
        options: generateFactOptions(continent.funFacts[0])
      }
    ];

    const selectedQuestion = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    setQuizQuestion(selectedQuestion.question);
    setQuizOptions(selectedQuestion.options);
    setQuizCorrectAnswer(selectedQuestion.correct);
    setQuizFeedback('');
  };

  const generateAnimalOptions = (correctAnimal: string) => {
    const allAnimals = continents.flatMap(c => c.animals);
    const wrongAnimals = allAnimals.filter(animal => 
      animal !== correctAnimal && 
      !continents.find(c => c.animals[0] === animal)
    );

    const options = [correctAnimal];
    while (options.length < 4 && wrongAnimals.length > 0) {
      const randomIndex = Math.floor(Math.random() * wrongAnimals.length);
      const animal = wrongAnimals.splice(randomIndex, 1)[0];
      if (!options.includes(animal)) {
        options.push(animal);
      }
    }

    return shuffleArray(options);
  };

  const generateAreaOptions = (correctArea: string) => {
    const areas = continents.map(c => c.area).filter(area => area !== correctArea);
    const options = [correctArea];

    while (options.length < 4 && areas.length > 0) {
      const randomIndex = Math.floor(Math.random() * areas.length);
      options.push(areas.splice(randomIndex, 1)[0]);
    }

    return shuffleArray(options);
  };

  const generateFactOptions = (correctFact: string) => {
    const allFacts = continents.flatMap(c => c.funFacts).filter(fact => fact !== correctFact);
    const options = [correctFact];

    while (options.length < 4 && allFacts.length > 0) {
      const randomIndex = Math.floor(Math.random() * allFacts.length);
      options.push(allFacts.splice(randomIndex, 1)[0]);
    }

    return shuffleArray(options);
  };

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const checkQuizAnswer = (answer: string) => {
    if (answer === quizCorrectAnswer) {
      setQuizFeedback('¡Correcto! 🎉 Eres un experto en geografía.');
    } else {
      setQuizFeedback(`¡Casi! La respuesta correcta es: ${quizCorrectAnswer}`);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Limpiar cualquier contenido anterior
    mountRef.current.innerHTML = '';

    // Escena
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000011);

    // Dimensiones (fallback para Jest/jsdom donde clientWidth/Height pueden ser 0)
    const initialWidth = mountRef.current.clientWidth || 800;
    const initialHeight = mountRef.current.clientHeight || 600;

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      initialWidth / initialHeight,
      0.1,
      1000
    );
    camera.position.z = 2.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setClearColor(0x000011, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Texturas
    const textures = loadRealisticTextures();

    // Sol (malla visible) + material correcto con emissive
    const sunGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: new THREE.Color(0xffff00),
      emissiveIntensity: 1,
      roughness: 0.5,
      metalness: 0
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(5, 3, 5);
    sunRef.current = sun;
    scene.add(sun);

    // Luces
    const ambientLight = new THREE.AmbientLight(0x333333, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.copy(sun.position);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffcc, 0.8, 100);
    pointLight.position.copy(sun.position);
    scene.add(pointLight);

    // Tierra
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: textures.dayTexture,
      bumpMap: textures.bumpTexture,
      bumpScale: 0.05,
      specularMap: textures.specularTexture,
      specular: new THREE.Color(0x333333),
      shininess: 5
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthRef.current = earth;
    scene.add(earth);

    // Nubes
    const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: textures.cloudsTexture,
      transparent: true,
      opacity: 0.4
    });
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    clouds.rotation.x = 0.1;
    cloudsRef.current = clouds;
    scene.add(clouds);

    // Estrellas
    const starGeometry = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    const starSizes: number[] = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starPositions.push(x, y, z);
      starSizes.push(Math.random() * 2);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.enablePan = false;
    controls.autoRotate = false;
    controlsRef.current = controls;

    // Animación
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (earthRef.current && !selectedContinent) {
        earth.rotation.y += 0.001;
        if (cloudsRef.current) {
          clouds.rotation.y += 0.0015;
        }
      }

      stars.rotation.x += 0.00005;
      stars.rotation.y += 0.00005;

      if (sunRef.current) {
        const time = Date.now() * 0.0001;
        sun.position.x = Math.cos(time) * 5;
        sun.position.z = Math.sin(time) * 5;

        directionalLight.position.copy(sun.position);
        pointLight.position.copy(sun.position);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Loaded
    setTimeout(() => setIsLoaded(true), 1000);

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;

      const width = mountRef.current.clientWidth || 800;
      const height = mountRef.current.clientHeight || 600;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      setIsLoaded(false);
      setTextureLoaded(false);

      controls.dispose();
      renderer.dispose();
      earthGeometry.dispose();
      (earthMaterial as THREE.Material).dispose();
      cloudsGeometry.dispose();
      (cloudsMaterial as THREE.Material).dispose();
      starGeometry.dispose();
      (starMaterial as THREE.Material).dispose();
      sunGeometry.dispose();
      (sunMaterial as THREE.Material).dispose();

      // Dispose de texturas
      Object.values(textures).forEach((tex) => tex && tex.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intencional: solo una vez al montar

  const resetView = () => {
    if (controlsRef.current && earthRef.current) {
      controlsRef.current.reset();
      earthRef.current.rotation.set(0, 0, 0);
      setSelectedContinent(null);
      setShowQuiz(false);
      setQuizFeedback('');
    }
  };

  const nextFact = () => {
    if (selectedContinent) {
      setCurrentFactIndex((prev) =>
        prev < selectedContinent.funFacts.length - 1 ? prev + 1 : 0
      );
    }
  };

  const startQuiz = () => {
    if (selectedContinent) {
      generateQuiz(selectedContinent);
      setShowQuiz(true);
      setQuizFeedback('');
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-b from-blue-900 to-purple-900">
      {/* Panel de control */}
      <div className="absolute top-4 left-4 z-10 space-y-3">
        <button
          onClick={resetView}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 text-sm font-bold flex items-center space-x-2 border-2 border-yellow-300"
        >
          <span className="text-lg">🌍</span>
          <span>Volver al Inicio</span>
        </button>

        <button
          onClick={toggleClouds}
          className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 text-sm font-bold flex items-center space-x-2 border-2 border-blue-300"
        >
          <span className="text-lg">{cloudsEnabled ? '☁️' : '🌤️'}</span>
          <span>{cloudsEnabled ? 'Sin Nubes' : 'Con Nubes'}</span>
        </button>

        <div className="bg-white bg-opacity-95 text-gray-800 px-4 py-3 rounded-2xl text-sm shadow-lg">
          <p className="font-bold text-blue-600 mb-2">🎮 Cómo Jugar:</p>
          <p className="flex items-center space-x-2 mb-1">
            <span className="text-lg">👆</span>
            <span>Toca los continentes</span>
          </p>
          <p className="flex items-center space-x-2 mb-1">
            <span className="text-lg">🔄</span>
            <span>Gira el globo</span>
          </p>
          <p className="flex items-center space-x-2">
            <span className="text-lg">🔍</span>
            <span>Acerca para ver mejor</span>
          </p>
        </div>
      </div>

      {/* Panel de continentes */}
      <div className="absolute top-4 right-4 z-10 bg-white bg-opacity-95 text-gray-800 p-4 rounded-2xl max-w-xs shadow-lg">
        <h3 className="text-xl font-bold mb-3 text-blue-600 flex items-center">
          <span className="text-2xl mr-2">🗺️</span>
          Continentes del Mundo
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {continents.map((continent) => (
            <button
              key={continent.name}
              onClick={() => {
                setSelectedContinent(continent);
                setCurrentFactIndex(0);
                setShowQuiz(false);
                setQuizFeedback('');
              }}
              className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedContinent?.name === continent.name
                  ? 'ring-2 ring-yellow-400 transform scale-105'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: continent.color }}
            >
              <div className="flex items-center space-x-1">
                <span className="text-sm">{continent.icon}</span>
                <span className="text-white font-bold">
                  {continent.name.split(' ')[0]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel de información del continente */}
      {selectedContinent && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white bg-opacity-95 text-gray-800 p-6 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl border-2 border-yellow-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center space-x-3">
              <span className="text-3xl">{selectedContinent.icon}</span>
              <span style={{ color: selectedContinent.color }}>
                {selectedContinent.name}
              </span>
            </h2>
            <button
              onClick={() => setSelectedContinent(null)}
              className="bg-red-400 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-bold text-blue-700">📏 Tamaño:</p>
              <p className="text-sm">{selectedContinent.area}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-green-700">👥 Personas:</p>
              <p className="text-sm">{selectedContinent.population}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-purple-700 flex items-center">
                <span className="text-lg mr-2">🌟</span>
                Datos Divertidos
              </h4>
              <button
                onClick={nextFact}
                className="bg-purple-400 hover:bg-purple-500 text-white px-3 py-1 rounded-lg text-sm"
              >
                Siguiente
              </button>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg min-h-[60px]">
              <p className="text-sm">
                {selectedContinent.funFacts[currentFactIndex]}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-bold text-orange-700 mb-2 flex items-center">
              <span className="text-lg mr-2">🐾</span>
              Animales que viven aquí:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedContinent.animals.map((animal, index) => (
                <span
                  key={index}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm hover:scale-105 transition-transform duration-200"
                >
                  {animal}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold w-full transition-all duration-200 transform hover:scale-105"
          >
            🎯 Jugar Quiz sobre {selectedContinent.name}
          </button>
        </div>
      )}

      {/* Quiz interactivo */}
      {showQuiz && selectedContinent && (
        <div className="absolute inset-0 z-20 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-center mb-4 text-blue-600">
              🎯 Quiz de {selectedContinent.name}
            </h3>
            <p className="text-center mb-6 text-lg font-medium">{quizQuestion}</p>

            <div className="space-y-3 mb-6">
              {quizOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => checkQuizAnswer(option)}
                  className="w-full text-left p-4 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-200 hover:scale-105 text-sm font-medium"
                  disabled={!!quizFeedback}
                >
                  {option}
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div
                className={`p-4 rounded-lg mb-4 text-center font-bold ${
                  quizFeedback.includes('Correcto')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {quizFeedback}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowQuiz(false);
                  setQuizFeedback('');
                }}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg font-bold"
              >
                Volver
              </button>
              {quizFeedback && (
                <button
                  onClick={startQuiz}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 rounded-lg font-bold"
                >
                  Nuevo Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mount de Three.js */}
      <div
        ref={mountRef}
        className="w-full h-full rounded-lg overflow-hidden bg-transparent"
        style={{
          minHeight: '600px',
          position: 'relative'
        }}
      />

      {/* Loading */}
      {(!isLoaded || !textureLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🌍</div>
            <div className="bg-white bg-opacity-90 text-gray-800 px-6 py-4 rounded-2xl text-lg font-bold shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Cargando la Tierra real...</span>
              </div>
              <p className="text-sm mt-2 text-gray-600">Usando imágenes de la NASA</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div className="absolute bottom-2 right-2 z-10 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs">
        <p>🛰️ Imágenes reales de la Tierra - NASA</p>
        <p>☀️ Sistema de iluminación realista</p>
      </div>

      {/* Indicador de textura */}
      {textureLoaded && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs animate-pulse">
          ✅ Tierra real cargada
        </div>
      )}
    </div>
  );
}