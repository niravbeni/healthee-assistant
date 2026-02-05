export const blobVertexShader = `
  uniform float uTime;
  uniform float uAudioIntensity;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Simplex 3D noise
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Multiple noise layers for organic movement
    float slowTime = uTime * 0.3;
    float fastTime = uTime * 0.8;

    // Base organic movement
    float noise1 = snoise(position * 1.5 + slowTime);
    float noise2 = snoise(position * 3.0 + fastTime * 0.5) * 0.5;
    float noise3 = snoise(position * 5.0 + slowTime * 2.0) * 0.25;

    float combinedNoise = noise1 + noise2 + noise3;

    // Audio-reactive displacement
    float baseDisplacement = 0.08;
    float audioDisplacement = uAudioIntensity * 0.4;

    float displacement = combinedNoise * (baseDisplacement + audioDisplacement);
    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const blobFragmentShader = `
  uniform float uTime;
  uniform float uAudioIntensity;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Base colors - purple to orange gradient
    vec3 color1 = vec3(0.4, 0.2, 0.8); // Purple
    vec3 color2 = vec3(1.0, 0.5, 0.1); // Orange
    vec3 color3 = vec3(0.9, 0.3, 0.5); // Pink accent

    // Fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);

    // Mix colors based on position and audio
    float mixFactor = (vPosition.y + 1.0) * 0.5;
    mixFactor += sin(uTime * 0.5) * 0.1;
    mixFactor += uAudioIntensity * 0.2;

    vec3 baseColor = mix(color1, color2, mixFactor);
    baseColor = mix(baseColor, color3, fresnel * 0.5 + uAudioIntensity * 0.3);

    // Add glow based on displacement and audio
    float glow = (vDisplacement + 0.1) * 2.0;
    glow += uAudioIntensity * 0.5;

    vec3 finalColor = baseColor + vec3(glow * 0.2);

    // Edge highlight
    finalColor += fresnel * vec3(0.5, 0.3, 0.2) * (1.0 + uAudioIntensity);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
