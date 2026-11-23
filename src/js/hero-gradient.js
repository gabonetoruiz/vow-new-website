/* Home hero background: "Velaris" living gradient (simplex-noise colour fields, vignette glow, film grain).
   Vanilla WebGL port of the React component, tuned to the VOW palette. */
(function heroGradient(){
  const canvas=document.getElementById('heroCanvas');
  if(!canvas)return;
  const host=canvas.parentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CONFIG={
    bg:'#0F0A4E',                                   // --ink
    colors:['#1C166C','#2D4CD7','#110C56','#95A4FF'], // royal-deep, --royal, deep-blue shadow (adds depth), --iris highlights
    speed:4.5,                                      // clearly flowing, still smooth (component default is 2.0)
    grain:.35
  };

  const gl=canvas.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});
  if(!gl){canvas.remove();return;} // CSS gradient fallback stays

  const VERT=`attribute vec2 position;varying vec2 vUv;
void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}`;
  const FRAG=`precision highp float;
varying vec2 vUv;
uniform vec2 u_resolution;uniform float u_time;uniform float u_grain;uniform vec3 u_colors[4];uniform vec3 u_bg;
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
m=m*m;m=m*m;
vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
return 130.0*dot(m,g);
}
void main(){
vec2 uv=vUv;float ratio=u_resolution.x/u_resolution.y;
vec2 p=uv-0.5;p.x*=ratio;
float t=u_time*0.1;
float n1=snoise(p*0.4+vec2(t*0.2,-t*0.3));
float n2=snoise(p*0.55+vec2(-t*0.15,t*0.25)+n1*0.25);
float n3=snoise(p*0.75+vec2(t*0.1,-t*0.2)+n2*0.2);
vec3 col=u_bg;
float dist=length(p)*1.5;
float vignette=1.0-smoothstep(0.3,1.2,dist);
col=mix(col,u_colors[0],smoothstep(-0.2,0.5,n1)*0.85);
col=mix(col,u_colors[1],smoothstep(-0.1,0.6,n2)*0.7);
col=mix(col,u_colors[2],smoothstep(-0.3,0.4,n3)*0.6);
col=mix(col,u_colors[3],smoothstep(0.0,0.7,n1*n2)*0.5);
float glow=smoothstep(0.8,0.0,dist)*0.3;
col+=u_colors[1]*glow;
col=mix(col*0.2,col,vignette);
float grain=fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453+u_time);
col+=(grain-0.5)*u_grain*0.1;
gl_FragColor=vec4(col,1.0);
}`;

  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(s));return null;}return s;};
  const vs=compile(gl.VERTEX_SHADER,VERT),fs=compile(gl.FRAGMENT_SHADER,FRAG);
  if(!vs||!fs){canvas.remove();return;}
  const prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){canvas.remove();return;}
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(prog,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

  const U=n=>gl.getUniformLocation(prog,n);
  const loc={res:U('u_resolution'),time:U('u_time'),grain:U('u_grain'),colors:U('u_colors'),bg:U('u_bg')};
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
  // Static uniforms are set once, not every frame
  gl.uniform3f(loc.bg,...hex(CONFIG.bg));
  gl.uniform3fv(loc.colors,new Float32Array(CONFIG.colors.flatMap(hex)));
  gl.uniform1f(loc.grain,CONFIG.grain);

  const resize=()=>{
    const dpr=Math.min(devicePixelRatio||1,innerWidth<768?1:1.5); // the field is soft; full retina adds cost, not detail
    canvas.width=Math.round(host.clientWidth*dpr);canvas.height=Math.round(host.clientHeight*dpr);
    gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(loc.res,canvas.width,canvas.height);
  };
  const draw=t=>{gl.uniform1f(loc.time,t*0.001*CONFIG.speed);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};

  const start=performance.now()-24000; // begin mid-flow so the first frame is already a rich composition
  let raf=0,visible=true,last=0;
  const frameMs=1000/60; // capped at 60fps: smooth for this flow, and half the GPU work of a 120Hz display
  const loop=now=>{raf=requestAnimationFrame(loop);if(now-last<frameMs-1)return;last=now;draw(now-start);};
  const run=()=>{if(!raf&&visible&&!document.hidden&&!reduce)raf=requestAnimationFrame(loop);};
  const halt=()=>{cancelAnimationFrame(raf);raf=0;};

  new ResizeObserver(()=>{resize();if(!raf)draw(performance.now()-start);}).observe(host);
  resize();draw(performance.now()-start);

  if(reduce)return; // reduced motion: one still frame, no loop
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?run():halt();}).observe(host);
  document.addEventListener('visibilitychange',()=>document.hidden?halt():run());
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();halt();canvas.remove();});

  run();
})();
