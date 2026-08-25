(function(f,w){typeof exports=="object"&&typeof module<"u"?w(exports):typeof define=="function"&&define.amd?define(["exports"],w):(f=typeof globalThis<"u"?globalThis:f||self,w(f.NsCommonUi={}))})(this,(function(f){"use strict";var Is=f=>{throw TypeError(f)};var qe=(f,w,C)=>w.has(f)||Is("Cannot "+C);var d=(f,w,C)=>(qe(f,w,"read from private field"),C?C.call(f):w.get(f)),g=(f,w,C)=>w.has(f)?Is("Cannot add the same private member more than once"):w instanceof WeakSet?w.add(f):w.set(f,C),c=(f,w,C,z)=>(qe(f,w,"write to private field"),z?z.call(f,C):w.set(f,C),C),l=(f,w,C)=>(qe(f,w,"access private method"),C);var Bs=(f,w,C,z)=>({set _(ae){c(f,w,ae,C)},get _(){return d(f,w,z)}});/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Ls,yt,it,qs,Ke,j,ot,V,x,Fe,Ve,We,Ft,Vt,Wt,Zt,Xt,Ze,me,Jt,Yt,R,Ks,Xe,Je,Qt,W,_t,wt,At,rt,S,Ye,$e,Qe,Fs,ye,be,Vs,at,lt,ct,kt,Ct,u,Ws,Ge,ts,Zs,Ot,es,xt,_e,dt,ie,ss,Xs,Js,oe,Ys,ht,St,Et,y,ns,re,ut,is,we,os,rs,as,Pt,Mt,Gt,Z,H,X,P,ls,cs,hs,Ut,te,ee,se,ne;const w=globalThis,C=w.ShadowRoot&&(w.ShadyCSS===void 0||w.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,z=Symbol(),ae=new WeakMap;let ds=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==z)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(C&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&ae.set(t,e))}return e}toString(){return this.cssText}};const Qs=i=>new ds(typeof i=="string"?i:i+"",void 0,z),D=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((n,s,o)=>n+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new ds(t,i,z)},Gs=(i,e)=>{if(C)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),s=w.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=t.cssText,i.appendChild(n)}},us=C?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return Qs(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:tn,defineProperty:en,getOwnPropertyDescriptor:sn,getOwnPropertyNames:nn,getOwnPropertySymbols:on,getPrototypeOf:rn}=Object,I=globalThis,ps=I.trustedTypes,an=ps?ps.emptyScript:"",Ae=I.reactiveElementPolyfillSupport,Tt=(i,e)=>i,le={toAttribute(i,e){switch(e){case Boolean:i=i?an:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},ke=(i,e)=>!tn(i,e),fs={attribute:!0,type:String,converter:le,reflect:!1,useDefault:!1,hasChanged:ke};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),I.litPropertyMetadata??(I.litPropertyMetadata=new WeakMap);let B=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=fs){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),s=this.getPropertyDescriptor(e,n,t);s!==void 0&&en(this.prototype,e,s)}}static getPropertyDescriptor(e,t,n){const{get:s,set:o}=sn(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:s,set(r){const a=s==null?void 0:s.call(this);o==null||o.call(this,r),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??fs}static _$Ei(){if(this.hasOwnProperty(Tt("elementProperties")))return;const e=rn(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Tt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Tt("properties"))){const t=this.properties,n=[...nn(t),...on(t)];for(const s of n)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,s]of t)this.elementProperties.set(n,s)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const s=this._$Eu(t,n);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const s of n)t.unshift(us(s))}else e!==void 0&&t.push(us(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Gs(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostConnected)==null?void 0:n.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostDisconnected)==null?void 0:n.call(t)})}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){var o;const n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){const r=(((o=n.converter)==null?void 0:o.toAttribute)!==void 0?n.converter:le).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){var o,r;const n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const a=n.getPropertyOptions(s),h=typeof a.converter=="function"?{fromAttribute:a.converter}:((o=a.converter)==null?void 0:o.fromAttribute)!==void 0?a.converter:le;this._$Em=s;const v=h.fromAttribute(t,a.type);this[s]=v??((r=this._$Ej)==null?void 0:r.get(s))??v,this._$Em=null}}requestUpdate(e,t,n,s=!1,o){var r;if(e!==void 0){const a=this.constructor;if(s===!1&&(o=this[e]),n??(n=a.getPropertyOptions(e)),!((n.hasChanged??ke)(o,t)||n.useDefault&&n.reflect&&o===((r=this._$Ej)==null?void 0:r.get(e))&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:s,wrapped:o},r){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,r??t??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var n;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[o,r]of s){const{wrapped:a}=r,h=this[o];a!==!0||this._$AL.has(o)||h===void 0||this.C(o,void 0,r,h)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(n=this._$EO)==null||n.forEach(s=>{var o;return(o=s.hostUpdate)==null?void 0:o.call(s)}),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(n=>{var s;return(s=n.hostUpdated)==null?void 0:s.call(n)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};B.elementStyles=[],B.shadowRootOptions={mode:"open"},B[Tt("elementProperties")]=new Map,B[Tt("finalized")]=new Map,Ae==null||Ae({ReactiveElement:B}),(I.reactiveElementVersions??(I.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Nt=globalThis,gs=i=>i,ce=Nt.trustedTypes,vs=ce?ce.createPolicy("lit-html",{createHTML:i=>i}):void 0,bs="$lit$",q=`lit$${Math.random().toFixed(9).slice(2)}$`,ms="?"+q,ln=`<${ms}>`,J=document,Rt=()=>J.createComment(""),Dt=i=>i===null||typeof i!="object"&&typeof i!="function",Ce=Array.isArray,cn=i=>Ce(i)||typeof(i==null?void 0:i[Symbol.iterator])=="function",xe=`[ 	
\f\r]`,jt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$s=/-->/g,ys=/>/g,Y=RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_s=/'/g,ws=/"/g,As=/^(?:script|style|textarea|title)$/i,ks=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),k=ks(1),he=ks(2),Q=Symbol.for("lit-noChange"),_=Symbol.for("lit-nothing"),Cs=new WeakMap,G=J.createTreeWalker(J,129);function xs(i,e){if(!Ce(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return vs!==void 0?vs.createHTML(e):e}const hn=(i,e)=>{const t=i.length-1,n=[];let s,o=e===2?"<svg>":e===3?"<math>":"",r=jt;for(let a=0;a<t;a++){const h=i[a];let v,A,p=-1,m=0;for(;m<h.length&&(r.lastIndex=m,A=r.exec(h),A!==null);)m=r.lastIndex,r===jt?A[1]==="!--"?r=$s:A[1]!==void 0?r=ys:A[2]!==void 0?(As.test(A[2])&&(s=RegExp("</"+A[2],"g")),r=Y):A[3]!==void 0&&(r=Y):r===Y?A[0]===">"?(r=s??jt,p=-1):A[1]===void 0?p=-2:(p=r.lastIndex-A[2].length,v=A[1],r=A[3]===void 0?Y:A[3]==='"'?ws:_s):r===ws||r===_s?r=Y:r===$s||r===ys?r=jt:(r=Y,s=void 0);const $=r===Y&&i[a+1].startsWith("/>")?" ":"";o+=r===jt?h+ln:p>=0?(n.push(v),h.slice(0,p)+bs+h.slice(p)+q+$):h+q+(p===-2?a:$)}return[xs(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class Ht{constructor({strings:e,_$litType$:t},n){let s;this.parts=[];let o=0,r=0;const a=e.length-1,h=this.parts,[v,A]=hn(e,t);if(this.el=Ht.createElement(v,n),G.currentNode=this.el.content,t===2||t===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(s=G.nextNode())!==null&&h.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(const p of s.getAttributeNames())if(p.endsWith(bs)){const m=A[r++],$=s.getAttribute(p).split(q),E=/([.?@])?(.*)/.exec(m);h.push({type:1,index:o,name:E[2],strings:$,ctor:E[1]==="."?un:E[1]==="?"?pn:E[1]==="@"?fn:de}),s.removeAttribute(p)}else p.startsWith(q)&&(h.push({type:6,index:o}),s.removeAttribute(p));if(As.test(s.tagName)){const p=s.textContent.split(q),m=p.length-1;if(m>0){s.textContent=ce?ce.emptyScript:"";for(let $=0;$<m;$++)s.append(p[$],Rt()),G.nextNode(),h.push({type:2,index:++o});s.append(p[m],Rt())}}}else if(s.nodeType===8)if(s.data===ms)h.push({type:2,index:o});else{let p=-1;for(;(p=s.data.indexOf(q,p+1))!==-1;)h.push({type:7,index:o}),p+=q.length-1}o++}}static createElement(e,t){const n=J.createElement("template");return n.innerHTML=e,n}}function pt(i,e,t=i,n){var r,a;if(e===Q)return e;let s=n!==void 0?(r=t._$Co)==null?void 0:r[n]:t._$Cl;const o=Dt(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==o&&((a=s==null?void 0:s._$AO)==null||a.call(s,!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,t,n)),n!==void 0?(t._$Co??(t._$Co=[]))[n]=s:t._$Cl=s),s!==void 0&&(e=pt(i,s._$AS(i,e.values),s,n)),e}class dn{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,s=((e==null?void 0:e.creationScope)??J).importNode(t,!0);G.currentNode=s;let o=G.nextNode(),r=0,a=0,h=n[0];for(;h!==void 0;){if(r===h.index){let v;h.type===2?v=new ft(o,o.nextSibling,this,e):h.type===1?v=new h.ctor(o,h.name,h.strings,this,e):h.type===6&&(v=new gn(o,this,e)),this._$AV.push(v),h=n[++a]}r!==(h==null?void 0:h.index)&&(o=G.nextNode(),r++)}return G.currentNode=J,s}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class ft{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,n,s){this.type=2,this._$AH=_,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=pt(this,e,t),Dt(e)?e===_||e==null||e===""?(this._$AH!==_&&this._$AR(),this._$AH=_):e!==this._$AH&&e!==Q&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):cn(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==_&&Dt(this._$AH)?this._$AA.nextSibling.data=e:this.T(J.createTextNode(e)),this._$AH=e}$(e){var o;const{values:t,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Ht.createElement(xs(n.h,n.h[0]),this.options)),n);if(((o=this._$AH)==null?void 0:o._$AD)===s)this._$AH.p(t);else{const r=new dn(s,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=Cs.get(e.strings);return t===void 0&&Cs.set(e.strings,t=new Ht(e)),t}k(e){Ce(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,s=0;for(const o of e)s===t.length?t.push(n=new ft(this.O(Rt()),this.O(Rt()),this,this.options)):n=t[s],n._$AI(o),s++;s<t.length&&(this._$AR(n&&n._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var n;for((n=this._$AP)==null?void 0:n.call(this,!1,!0,t);e!==this._$AB;){const s=gs(e).nextSibling;gs(e).remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class de{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,s,o){this.type=1,this._$AH=_,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=_}_$AI(e,t=this,n,s){const o=this.strings;let r=!1;if(o===void 0)e=pt(this,e,t,0),r=!Dt(e)||e!==this._$AH&&e!==Q,r&&(this._$AH=e);else{const a=e;let h,v;for(e=o[0],h=0;h<o.length-1;h++)v=pt(this,a[n+h],t,h),v===Q&&(v=this._$AH[h]),r||(r=!Dt(v)||v!==this._$AH[h]),v===_?e=_:e!==_&&(e+=(v??"")+o[h+1]),this._$AH[h]=v}r&&!s&&this.j(e)}j(e){e===_?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class un extends de{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===_?void 0:e}}class pn extends de{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==_)}}class fn extends de{constructor(e,t,n,s,o){super(e,t,n,s,o),this.type=5}_$AI(e,t=this){if((e=pt(this,e,t,0)??_)===Q)return;const n=this._$AH,s=e===_&&n!==_||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==_&&(n===_||s);s&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class gn{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){pt(this,e)}}const vn={I:ft},Se=Nt.litHtmlPolyfillSupport;Se==null||Se(Ht,ft),(Nt.litHtmlVersions??(Nt.litHtmlVersions=[])).push("3.3.3");const bn=(i,e,t)=>{const n=(t==null?void 0:t.renderBefore)??e;let s=n._$litPart$;if(s===void 0){const o=(t==null?void 0:t.renderBefore)??null;n._$litPart$=s=new ft(e.insertBefore(Rt(),o),o,void 0,t??{})}return s._$AI(i),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tt=globalThis;let M=class extends B{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=bn(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return Q}};M._$litElement$=!0,M.finalized=!0,(Ls=tt.litElementHydrateSupport)==null||Ls.call(tt,{LitElement:M});const Ee=tt.litElementPolyfillSupport;Ee==null||Ee({LitElement:M}),(tt.litElementVersions??(tt.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const mn={attribute:!0,type:String,converter:le,reflect:!1,hasChanged:ke},$n=(i=mn,e,t)=>{const{kind:n,metadata:s}=t;let o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),n==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),n==="accessor"){const{name:r}=t;return{set(a){const h=e.get.call(this);e.set.call(this,a),this.requestUpdate(r,h,i,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,i,a),a}}}if(n==="setter"){const{name:r}=t;return function(a){const h=this[r];e.call(this,a),this.requestUpdate(r,h,i,!0,a)}}throw Error("Unsupported decorator location: "+n)};function b(i){return(e,t)=>typeof t=="object"?$n(i,e,t):((n,s,o)=>{const r=s.hasOwnProperty(o);return s.constructor.createProperty(o,n),r?Object.getOwnPropertyDescriptor(s,o):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Pe(i){return b({...i,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const yn=(i,e,t)=>(t.configurable=!0,t.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(i,e,t),t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function _n(i,e){return(t,n,s)=>{const o=r=>{var a;return((a=r.renderRoot)==null?void 0:a.querySelector(i))??null};return yn(t,n,{get(){return o(this)}})}}function O(i,e){typeof window>"u"||!("customElements"in window)||customElements.get(i)||customElements.define(i,e)}let Me=!1;const wn=`[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`,Ss=()=>getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim()!=="";function U(){if(Me||typeof document>"u"||typeof getComputedStyle>"u")return;if(Ss()){Me=!0;return}Me=!0;const i=()=>{Ss()||console.warn(wn)};document.readyState==="complete"?i():window.addEventListener("load",i,{once:!0})}const Es=new WeakMap;function Lt(i,e){for(const[t,n]of Object.entries(e)){const s=[t,t.replaceAll("-","")].find(r=>i.hasAttribute(r));if(s===void 0)continue;let o=Es.get(i);o===void 0&&Es.set(i,o=new Set),!o.has(s)&&(o.add(s),console.warn(`[${i.localName}] ${s} 속성은 무시됩니다 — 이 이름은 프로퍼티 전용입니다.
  HTML 에서 쓸 것: ${n}
  JS 에서는 el.${An(t)} 에 대입합니다.`))}}const An=i=>i.replace(/-([a-z])/g,(e,t)=>t.toUpperCase()),kn=D`
  /* 네이티브 dialog 가 top layer 로 올라가므로 호스트는 자리를 차지하지 않는다. */
  :host {
    display: contents;
  }

  dialog {
    /*
      UA 스타일시트의 margin: auto 가 modal dialog 의 유일한 가운데 정렬 수단이다.
      Tailwind preflight 는 shadow 안에 닿지 않지만 소비자가 전역 dialog 규칙을
      둘 수 있으므로 명시한다. 참고 구현이 실제로 물린 함정이다.
    */
    margin: auto;
    box-sizing: border-box;
    /*
      폭은 --ns-dialog-width 에서 받고, min() 클램프는 여기 남긴다. 소비자가
      폼 대화상자를 넓히려고 그 값을 키워도 작은 화면에서 넘치지 않는다.
      커스텀 프로퍼티라 shadow 경계를 넘어 인스턴스별로 덮을 수 있다.
    */
    width: min(var(--ns-dialog-width), calc(100vw - var(--ns-dialog-margin)));
    max-height: calc(100vh - var(--ns-dialog-margin));
    padding: 0;
    border: 0;
    border-radius: var(--ns-radius-card);
    background: var(--ns-color-surface);
    color: var(--ns-color-fg-body);
    box-shadow: var(--ns-elevation-card);
    /* 본문만 스크롤되고 헤더·푸터는 고정된다. */
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /*
    UA 스타일시트의 dialog:not([open]) { display: none } 은 !important 가 아니고,
    author 선언은 cascade origin 에서 user-agent 를 이긴다 — 위의 display: flex 가
    닫힌 상태에도 적용된다. :host 가 display: contents 라 호스트는 박스를 만들지
    않으므로, 되돌리지 않으면 닫힌 대화상자의 내용이 페이지에 그대로 그려진다.
    (아래 .footer[hidden] 과 같은 종류의 함정이다.)

    특정도가 (0,1,1) 로 위 규칙 (0,0,1) 보다 높아 순서에 의존하지 않는다.
  */
  dialog:not([open]) {
    display: none;
  }

  dialog::backdrop {
    background: var(--ns-color-overlay);
  }

  .header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ns-space-4);
    padding: var(--ns-space-5) var(--ns-space-6);
    border-bottom: 1px solid var(--ns-color-line);
  }

  h2 {
    margin: 0;
    font-size: var(--ns-font-size-lg);
    line-height: var(--ns-line-height-lg);
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  /*
    controls.css 는 shadow 안에 도달하지 않으므로 .ns-button 을 쓸 수 없다.
    --ghost·--icon 조합에 해당하는 최소한만 다시 적는다. 설계 문서 §9 가
    이 중복을 수용한 유일한 자리로 지목한 곳이다.
  */
  .close {
    flex: none;
    display: grid;
    place-items: center;
    padding: var(--ns-space-1-5);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: transparent;
    color: var(--ns-color-fg-muted);
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .close:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /*
    controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다.
    이 버튼은 showModal() 이 자동 포커스하는 첫 요소이므로 특히 필요하다.
  */
  .close:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--ns-space-6);
  }

  /*
    footer 는 내용이 있을 때만 보인다. slot 에 배정된 노드가 있는지는 CSS 로
    알 수 없어 slotchange 로 판정하고 hidden 속성을 건다.
    display: flex 가 UA 의 [hidden] 규칙을 이기므로 명시적으로 되돌린다.
  */
  .footer {
    flex: none;
    display: flex;
    justify-content: flex-end;
    gap: var(--ns-space-2);
    padding: 0 var(--ns-space-6) var(--ns-space-6);
  }

  .footer[hidden] {
    display: none;
  }
`,ue={menu:{viewBox:"0 0 20 20",content:he`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},close:{viewBox:"0 0 20 20",content:he`
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},google:{viewBox:"0 0 18 18",content:he`
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    `}};function Cn(i){Object.assign(ue,i)}const xn=D`
  /*
    크기를 --ns-icon-size 에서 받는다. tokens.css 의 ns-icon 요소 선택자에만
    의존할 수 없다 — 그 선택자는 문서 트리에만 적용되므로 ns-dialog 의 shadow
    안에 있는 <ns-icon> 에는 닿지 못하고, 그러면 아이콘이 크기를 잃어 내부 svg 의
    width/height: 100% 가 부모를 그대로 채운다. 실제로 대화상자 닫기 버튼이
    그렇게 깨졌다.

    커스텀 프로퍼티는 상속되므로 문서·중첩 shadow 어디서든 도달한다. 값은
    tokens.css 의 :root 한 곳에만 있다.
  */
  :host {
    display: inline-flex;
    flex: none;
    width: var(--ns-icon-size);
    height: var(--ns-icon-size);
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  /*
    슬롯으로 들어온 것을 이 상자에 맞춘다.

    소비자가 넣는 것은 대개 자기 크기를 갖고 온다 — lucide-react 는 width/height
    속성을 24 로 찍고, 손으로 적은 <svg> 도 보통 그렇다. 그대로 두면 아이콘마다
    크기가 달라지고, 어디서 온 것이냐에 따라 --ns-icon-size 가 먹기도 안 먹기도 한다.
    여기서 정규화하면 출처와 무관하게 ns-icon 하나가 크기의 단일 권한이 된다.

    프레젠테이션 속성(width="24")은 어떤 CSS 규칙에도 지므로 선택자를 세게 쓸
    필요가 없다. 소비자가 굳이 다른 크기를 원하면 그 요소에 style 을 주면 된다 —
    인라인 스타일은 이 규칙을 이긴다.

    **이 규칙만으로는 부족하다.** ::slotted 는 shadow root 가 생긴 뒤에만 존재하므로
    upgrade 전에는 자식이 자기 크기(24)로 그려지다가 upgrade 직후 줄어든다.
    tokens.css 가 같은 선언을 "ns-icon > *" 로 문서 트리에도 두어 그 구간을 덮는다.
    둘 다 필요하다 — 문서 선택자는 다른 컴포넌트 shadow 안의 ns-icon 에 닿지 못하고,
    ::slotted 는 upgrade 전에 존재하지 않는다. 위 :host 의 크기가 tokens.css 의
    ns-icon 요소 선택자와 짝을 이루는 것과 같은 이유다.
  */
  ::slotted(*) {
    display: block;
    width: 100%;
    height: 100%;
  }
`;var Sn=Object.defineProperty,En=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Sn(e,t,s),s};const Te=class Te extends M{constructor(){super(...arguments);g(this,it);g(this,yt);this.name="",c(this,yt,"")}connectedCallback(){super.connectedCallback(),U()}render(){return k`<slot>${l(this,it,qs).call(this)}</slot>`}updated(){var n;const t=((n=this.renderRoot.querySelector("slot"))==null?void 0:n.assignedNodes())??[];if(!t.some(s=>s.nodeType===Node.ELEMENT_NODE)){if(t.length>0){l(this,it,Ke).call(this,`공백-${this.name}`,`[ns-icon] 공백만 든 자식이 슬롯을 채워 name="${this.name}" 폴백이 그려지지 않았다. <ns-icon name="${this.name}"></ns-icon> 처럼 안쪽을 붙여 쓴다.`);return}this.name!==""&&!ue[this.name]&&l(this,it,Ke).call(this,`없음-${this.name}`,`[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(ue).join(", ")}. registerIcons() 로 더하거나, 자식으로 직접 넣는다 — <ns-icon><MyIcon /></ns-icon> 는 name 없이 동작한다.`)}}};yt=new WeakMap,it=new WeakSet,qs=function(){if(this.name==="")return _;const t=ue[this.name];return t?k`<svg viewBox=${t.viewBox} fill="none" aria-hidden="true">${t.content}</svg>`:_},Ke=function(t,n){d(this,yt)!==t&&(c(this,yt,t),console.warn(n))},Te.styles=xn;let zt=Te;En([b({type:String})],zt.prototype,"name"),O("ns-icon",zt);var Pn=Object.defineProperty,gt=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Pn(e,t,s),s};const Ne=class Ne extends M{constructor(){super(...arguments);g(this,x);g(this,j);g(this,ot);g(this,V);g(this,Ft);g(this,Vt);g(this,Wt);g(this,Zt);g(this,Xt);this.heading="",this.defaultOpen=!1,this.noBackdropClose=!1,this.hasFooter=!1,c(this,j,!1),c(this,ot,!1),c(this,V,!1),c(this,Ft,t=>{const n=t.target;this.hasFooter=n.assignedNodes({flatten:!0}).length>0}),c(this,Vt,()=>{if(d(this,V)){c(this,V,!1);return}l(this,x,me).call(this,"escape")}),c(this,Wt,()=>{l(this,x,me).call(this,"close-button")}),c(this,Zt,t=>{c(this,ot,l(this,x,Ze).call(this,t))}),c(this,Xt,t=>{const n=d(this,ot);c(this,ot,!1),!this.noBackdropClose&&t.detail!==0&&(!n||!l(this,x,Ze).call(this,t)||l(this,x,me).call(this,"backdrop"))})}connectedCallback(){super.connectedCallback(),U(),Lt(this,{open:"default-open"});const t=this.dialogEl;t!=null&&t.open&&(c(this,V,!0),t.close()),this.requestUpdate()}firstUpdated(){this.defaultOpen&&c(this,j,!0)}show(){l(this,x,We).call(this,"show")||(c(this,j,!0),this.requestUpdate())}close(){l(this,x,We).call(this,"close")||(c(this,j,!1),this.requestUpdate())}updated(){const t=this.dialogEl;t&&(d(this,x,Ve)&&!t.open?this.isConnected&&t.showModal():!d(this,x,Ve)&&t.open&&(c(this,V,!0),t.close()))}render(){return k`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${d(this,Vt)}
        @mousedown=${d(this,Zt)}
        @click=${d(this,Xt)}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${d(this,Wt)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${d(this,Ft)}></slot>
        </div>
      </dialog>
    `}};j=new WeakMap,ot=new WeakMap,V=new WeakMap,x=new WeakSet,Fe=function(){return this.open!==void 0},Ve=function(){return this.open??d(this,j)},We=function(t){return d(this,x,Fe)?(console.warn(`[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${t}() 가 동작하지 않습니다. open 을 바꾸세요.`),!0):!1},Ft=new WeakMap,Vt=new WeakMap,Wt=new WeakMap,Zt=new WeakMap,Xt=new WeakMap,Ze=function(t){const n=this.dialogEl;if(!n)return!1;const s=n.getBoundingClientRect();return t.clientX<s.left||t.clientX>s.right||t.clientY<s.top||t.clientY>s.bottom},me=function(t){d(this,x,Fe)||c(this,j,!1);const n={reason:t};this.dispatchEvent(new CustomEvent("ns-dialog-close",{detail:n,bubbles:!0,composed:!0})),this.requestUpdate()},Ne.styles=kn;let T=Ne;gt([b({type:String})],T.prototype,"heading"),gt([b({attribute:!1})],T.prototype,"open"),gt([b({type:Boolean,attribute:"default-open"})],T.prototype,"defaultOpen"),gt([b({type:Boolean,attribute:"no-backdrop-close"})],T.prototype,"noBackdropClose"),gt([_n("dialog")],T.prototype,"dialogEl"),gt([Pe()],T.prototype,"hasFooter"),O("ns-dialog",T);const Mn=D`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--ns-header-height);
  }

  header {
    display: flex;
    height: 100%;
    align-items: center;
    gap: var(--ns-space-3);
    border-bottom: 1px solid var(--ns-color-line);
    background: var(--ns-color-surface);
    padding-inline: var(--ns-space-4);
  }

  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--ns-control-height-md);
    height: var(--ns-control-height-md);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: transparent;
    color: var(--ns-color-fg-body);
    cursor: pointer;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .toggle:hover {
    background: var(--ns-color-surface-hover);
  }

  /* controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다. */
  .toggle:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }

  .title {
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  /* margin-left: auto 가 남은 공간을 흡수해 actions 를 우측에 붙인다. */
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
  }
`;var On=Object.defineProperty,Ps=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&On(e,t,s),s};const Re=class Re extends M{constructor(){super(...arguments);g(this,Jt);this.projectName="",this.sidebarOpen=!1,c(this,Jt,()=>{const t={open:!this.sidebarOpen};this.dispatchEvent(new CustomEvent("ns-toggle",{detail:t,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),U()}render(){return k`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen?"true":"false"}
          aria-label=${this.sidebarOpen?"사이드바 닫기":"사이드바 열기"}
          @click=${d(this,Jt)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `}};Jt=new WeakMap,Re.styles=Mn;let vt=Re;Ps([b({type:String,attribute:"project-name"})],vt.prototype,"projectName"),Ps([b({type:Boolean,reflect:!0,attribute:"sidebar-open"})],vt.prototype,"sidebarOpen"),O("ns-header",vt);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Un={CHILD:2},Tn=i=>(...e)=>({_$litDirective$:i,values:e});let Nn=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{I:Rn}=vn,Ms=i=>i,Os=()=>document.createComment(""),It=(i,e,t)=>{var o;const n=i._$AA.parentNode,s=e===void 0?i._$AB:e._$AA;if(t===void 0){const r=n.insertBefore(Os(),s),a=n.insertBefore(Os(),s);t=new Rn(r,a,i,i.options)}else{const r=t._$AB.nextSibling,a=t._$AM,h=a!==i;if(h){let v;(o=t._$AQ)==null||o.call(t,i),t._$AM=i,t._$AP!==void 0&&(v=i._$AU)!==a._$AU&&t._$AP(v)}if(r!==s||h){let v=t._$AA;for(;v!==r;){const A=Ms(v).nextSibling;Ms(n).insertBefore(v,s),v=A}}}return t},et=(i,e,t=i)=>(i._$AI(e,t),i),Dn={},jn=(i,e=Dn)=>i._$AH=e,Hn=i=>i._$AH,Oe=i=>{i._$AR(),i._$AA.remove()};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Us=(i,e,t)=>{const n=new Map;for(let s=e;s<=t;s++)n.set(i[s],s);return n},pe=Tn(class extends Nn{constructor(i){if(super(i),i.type!==Un.CHILD)throw Error("repeat() can only be used in text expressions")}dt(i,e,t){let n;t===void 0?t=e:e!==void 0&&(n=e);const s=[],o=[];let r=0;for(const a of i)s[r]=n?n(a,r):r,o[r]=t(a,r),r++;return{values:o,keys:s}}render(i,e,t){return this.dt(i,e,t).values}update(i,[e,t,n]){const s=Hn(i),{values:o,keys:r}=this.dt(e,t,n);if(!Array.isArray(s))return this.ut=r,o;const a=this.ut??(this.ut=[]),h=[];let v,A,p=0,m=s.length-1,$=0,E=o.length-1;for(;p<=m&&$<=E;)if(s[p]===null)p++;else if(s[m]===null)m--;else if(a[p]===r[$])h[$]=et(s[p],o[$]),p++,$++;else if(a[m]===r[E])h[E]=et(s[m],o[E]),m--,E--;else if(a[p]===r[E])h[E]=et(s[p],o[E]),It(i,h[E+1],s[p]),p++,E--;else if(a[m]===r[$])h[$]=et(s[m],o[$]),It(i,s[p],s[m]),m--,$++;else if(v===void 0&&(v=Us(r,$,E),A=Us(a,p,m)),v.has(a[p]))if(v.has(a[m])){const L=A.get(r[$]),Be=L!==void 0?s[L]:null;if(Be===null){const zs=It(i,s[p]);et(zs,o[$]),h[$]=zs}else h[$]=et(Be,o[$]),It(i,s[p],Be),s[L]=null;$++}else Oe(s[m]),m--;else Oe(s[p]),p++;for(;$<=E;){const L=It(i,h[E+1]);et(L,o[$]),h[$++]=L}for(;p<=m;){const L=s[p++];L!==null&&Oe(L)}return this.ut=r,jn(i,h),Q}});var Ln=Object.defineProperty,K=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Ln(e,t,s),s};class N extends M{constructor(){super(...arguments);g(this,R);g(this,Yt);this.options=[],this.defaultValue=[],this.searchPlaceholder="검색",this.emptyMessage="결과가 없습니다",this.inputId="",this.inputDescribedby="",this.query=""}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),Lt(this,{value:"defaultValue 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",options:"options 프로퍼티 (배열은 속성으로 쓸 수 없습니다)","default-value":"defaultValue 프로퍼티"})}render(){const t=d(this,R,Xe),n=t.flatMap(r=>this.options.filter(a=>a.value===r)),s=this.query.trim().toLowerCase(),o=s===""?this.options:this.options.filter(r=>[r.label,r.meta??""].some(a=>a.toLowerCase().includes(s)));return k`
      ${n.length===0?_:k`
            <div class="ns-multi-select__chips">
              ${pe(n,r=>r.value,r=>k`
                  <span class="ns-chip">
                    ${r.label}
                    <button
                      class="ns-chip__remove"
                      type="button"
                      aria-label=${`${r.label} 제거`}
                      @click=${()=>l(this,R,Je).call(this,r.value)}
                    >
                      ×
                    </button>
                  </span>
                `)}
            </div>
          `}

      <!-- 라벨·hint 는 검색창에 건다 — 이 컴포넌트에서 포커스를 받는 곳이 여기다. -->
      <input
        class="ns-input"
        type="text"
        id=${this.inputId===""?_:this.inputId}
        aria-describedby=${this.inputDescribedby===""?_:this.inputDescribedby}
        .value=${this.query}
        placeholder=${this.searchPlaceholder}
        @input=${r=>{this.query=r.target.value}}
      />

      <div class="ns-multi-select__list">
        ${o.length===0?k`<p class="ns-multi-select__empty">${this.emptyMessage}</p>`:pe(o,r=>r.value,r=>k`
                <label class="ns-checkbox">
                  <input
                    type="checkbox"
                    .checked=${t.includes(r.value)}
                    @change=${a=>l(this,R,Je).call(this,r.value,a.target)}
                  />
                  <span>${r.label}</span>
                  ${r.meta===void 0?_:k`<span class="ns-checkbox__hint">${r.meta}</span>`}
                </label>
              `)}
      </div>
    `}}Yt=new WeakMap,R=new WeakSet,Ks=function(){return this.value!==void 0},Xe=function(){return this.value??d(this,Yt)??this.defaultValue},Je=function(t,n){const s=d(this,R,Xe),o=s.includes(t)?s.filter(a=>a!==t):[...s,t];d(this,R,Ks)?n!==void 0&&(n.checked=s.includes(t)):(c(this,Yt,o),this.requestUpdate());const r={values:o};this.dispatchEvent(new CustomEvent("ns-multi-select-change",{detail:r,bubbles:!0,composed:!0}))},K([b({attribute:!1})],N.prototype,"options"),K([b({attribute:!1})],N.prototype,"value"),K([b({attribute:!1})],N.prototype,"defaultValue"),K([b({type:String,attribute:"search-placeholder"})],N.prototype,"searchPlaceholder"),K([b({type:String,attribute:"empty-message"})],N.prototype,"emptyMessage"),K([b({type:String,attribute:"input-id"})],N.prototype,"inputId"),K([b({type:String,attribute:"input-describedby"})],N.prototype,"inputDescribedby"),K([Pe()],N.prototype,"query"),O("ns-multi-select",N);const zn=D`
  :host {
    display: block;
  }

  /*
    그룹 사이 간격. 원본은 .section + .section 이었지만 여기서는 형제가
    light DOM 의 호스트라 shadow 안에서 선택할 수 없다. ::slotted() 는
    결합자를 받지 않으므로 사이드바 쪽에서도 불가능하다. :host() 는
    복합 선택자를 받으므로 형제를 보는 방법은 이것뿐이다.

    다만 선언은 호스트가 아니라 shadow 안의 래퍼에 둔다. 호스트는 문서
    트리에 있어 소비자의 "* { margin: 0 }"(Tailwind preflight)이 :host 를
    이기고, 0.2.0 까지 여기 있던 margin-top 은 그렇게 지워지고 있었다.
    그룹이 하나뿐이면 :not(:first-child) 가 발동하지 않아 증상이 없다가
    두 번째 그룹을 만드는 순간 간격이 0 이 된다.

    margin 이 아니라 padding 인 이유는 마진 상쇄다. margin-top 을 래퍼에
    두면 호스트를 통과해 밖으로 상쇄돼 나가므로 결과는 같지만, 소비자가
    호스트에 마진을 주는 순간 둘이 상쇄돼 합이 달라진다. padding 은
    상쇄되지 않는다. 배경이 없어 보이는 결과는 margin 과 같다.
  */
  :host(:not(:first-child)) [role="group"] {
    padding-top: var(--ns-space-6);
  }

  .heading {
    display: var(--ns-label-display, block);
    padding: var(--ns-space-4) var(--ns-space-4) var(--ns-space-2);
    font-size: var(--ns-font-size-xs);
    line-height: var(--ns-line-height-xs);
    font-weight: var(--ns-weight-semibold);
    letter-spacing: 0.05em;
    color: var(--ns-color-fg-subtle);
  }

  .list {
    padding: var(--ns-space-2);
  }
`;var In=Object.defineProperty,Bn=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&In(e,t,s),s};const De=class De extends M{constructor(){super(...arguments),this.heading=""}connectedCallback(){super.connectedCallback(),U()}render(){return k`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `}};De.styles=zn;let Bt=De;Bn([b({type:String})],Bt.prototype,"heading"),O("ns-nav-group",Bt);const qn=D`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2-5);
    margin-bottom: var(--ns-space-1);
    border-radius: var(--ns-radius-control);
    padding: var(--ns-space-2);
    color: var(--ns-color-fg-body);
    text-decoration: none;
    transition: background-color var(--ns-transition-fast) var(--ns-transition-ease),
      color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .row:hover {
    background: var(--ns-color-surface-sunken);
  }

  :host([active]) .row {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /* 접힌 레일에서 유일하게 남는 자리라 flex 축소를 막는다. */
  .leading {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--ns-control-height-sm);
    height: var(--ns-control-height-sm);
  }

  /*
    이 규칙이 하는 일은 상한을 씌우는 것뿐이다 — 슬롯에 들어온 것이 위 .leading
    사각형 밖으로 커지지 않게 막는다. 크기 자체는 여기서 주지 않는다. 보통 들어오는
    <ns-icon> 은 자기 shadow 의 :host 에서 --ns-icon-size 로 크기를 갖고,
    그것이 이 상한보다 작아 상한이 발동하지 않는다. 크기가 없는 것을 넣으면
    이 규칙은 그것을 키워 주지 않는다.
  */
  ::slotted([slot="leading"]) {
    max-width: 100%;
    max-height: 100%;
  }

  .badge {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: var(--ns-radius-badge);
    background: var(--ns-color-surface-hover);
    font-size: var(--ns-font-size-2xs);
    line-height: var(--ns-line-height-2xs);
    font-weight: var(--ns-weight-semibold);
  }

  /*
    활성 배지도 채움면이라 --ns-color-accent 가 아니라 --ns-color-accent-fill 을
    읽는다. 나뉜 이유는 tokens.css 에 있다 — 액센트는 선·링, 이쪽은 면이다.
    밝은 모드는 두 토큰의 값이 같아 달라지지 않는다.

    **다크에서는 이 배지가 자기 행 배경에서 거의 떨어지지 않는다.** 활성 행이
    --ns-color-surface-hover(27.4%)이고 배지가 37% 라 둘의 대비가 1.42:1 이다
    (채움면 분리 전에는 87.1% 라 10.08:1 이었다). .ns-tabs__count 가 받은 것과
    같은 값 짝이고 그래서 같은 수치다 — controls.css 의 그 규칙 주석을 함께 본다.
    활성 신호는 행 배경·글자색이 함께 지므로 활성 항목을 못 알아보게 되지는
    않지만, **배지 하나만 놓고 보면 실제로 나빠진 것이 맞다. 알고 넣은 저하다.**
    docs/pending-human-checks.md 에 판정 항목으로 적어 두었다.
  */
  :host([active]) .badge {
    background: var(--ns-color-accent-fill);
    color: var(--ns-color-accent-fill-fg);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.

    --ns-label-display 는 ns-sidebar 가 ::slotted 로 내려주는 패키지
    내부 프로퍼티다. 사이드바 밖에서 단독으로 쓰일 때를 위해 여기만
    폴백을 둔다.
  */
  .label {
    display: var(--ns-label-display, block);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-medium);
  }

  .trailing {
    display: var(--ns-label-display, block);
    flex: none;
  }
`;var Kn=Object.defineProperty,fe=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Kn(e,t,s),s};const je=class je extends M{constructor(){super(...arguments);g(this,Qt);this.href="",this.label="",this.badge="",this.active=!1,c(this,Qt,t=>{if(t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;t.preventDefault();const n={href:this.href,label:this.label};this.dispatchEvent(new CustomEvent("ns-navigate",{detail:n,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),U()}render(){return k`
      <a class="row" href=${this.href} title=${this.label} @click=${d(this,Qt)}>
        <span class="leading">
          <slot name="leading">
            <span class="badge" aria-hidden="true">${this.badge}</span>
          </slot>
        </span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `}};Qt=new WeakMap,je.styles=qn;let F=je;fe([b({type:String})],F.prototype,"href"),fe([b({type:String})],F.prototype,"label"),fe([b({type:String})],F.prototype,"badge"),fe([b({type:Boolean,reflect:!0})],F.prototype,"active"),O("ns-nav-item",F);const Fn=D`
  :host {
    display: block;
  }

  h1 {
    margin: 0;
    font-size: var(--ns-font-size-xl);
    line-height: var(--ns-line-height-xl);
    font-weight: var(--ns-weight-semibold);
    color: var(--ns-color-fg);
  }

  p {
    margin: var(--ns-space-1-5) 0 0;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-muted);
  }
`;var Vn=Object.defineProperty,Ts=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Vn(e,t,s),s};const He=class He extends M{constructor(){super(...arguments),this.heading="",this.description=""}connectedCallback(){super.connectedCallback(),U()}render(){return k`
      <h1>${this.heading}</h1>
      ${this.description?k`<p>${this.description}</p>`:_}
    `}};He.styles=Fn;let bt=He;Ts([b({type:String})],bt.prototype,"heading"),Ts([b({type:String})],bt.prototype,"description"),O("ns-page-heading",bt);var Wn=Object.defineProperty,ge=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Wn(e,t,s),s};function Zn(i,e){if(e<=7)return Array.from({length:e},(o,r)=>r+1);const t=[1,i-1,i,i+1,e].filter(o=>o>=1&&o<=e).sort((o,r)=>o-r),n=[];let s=0;for(const o of t)o!==s&&(s!==0&&o-s>1&&n.push("gap"),n.push(o),s=o);return n}class mt extends M{constructor(){super(...arguments);g(this,S);g(this,W);g(this,_t);g(this,wt);g(this,At);g(this,rt);this.total=0,this.perPage=20,this.defaultPage=1,c(this,W,1),c(this,_t,!1),c(this,wt,!1),c(this,At,!1),c(this,rt,null)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),Lt(this,{page:"default-page"})}willUpdate(){if(!this.hasUpdated){if(!Number.isInteger(this.defaultPage)||this.defaultPage<1){console.warn(`[ns-pagination] default-page=${this.defaultPage} 는 1 이상의 정수여야 합니다. 1 페이지에서 시작합니다.`);return}this.defaultPage!==1&&c(this,W,this.defaultPage)}}updated(){var o;const t=d(this,rt);if(t===null||(c(this,rt,null),(this.page??d(this,W))!==t.page))return;const n=this.ownerDocument.activeElement;if(n!==null&&n!==this.ownerDocument.body&&!this.contains(n))return;const s=typeof t.control=="number"?`button[data-ns-page="${t.control}"]`:`button[data-ns-nav="${t.control}"]`;(o=this.querySelector(s))==null||o.focus()}render(){const t=d(this,S,$e);if(t<=1)return _;const n=l(this,S,Qe).call(this);return k`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${n===1?"true":_}
          @click=${()=>l(this,S,ye).call(this,"prev",n-1)}
        >
          이전
        </button>
        ${pe(Zn(n,t),(s,o)=>s==="gap"?`gap-${o}`:s,s=>s==="gap"?k`<span class="ns-pagination-gap" aria-hidden="true">…</span>`:k`<button
                  class=${s===n?"ns-button ns-button--outline ns-button--sm":"ns-button ns-button--ghost ns-button--sm"}
                  type="button"
                  data-ns-page=${s}
                  aria-current=${s===n?"page":_}
                  @click=${()=>l(this,S,ye).call(this,s,s)}
                >
                  ${s}
                </button>`)}
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${n===t?"true":_}
          @click=${()=>l(this,S,ye).call(this,"next",n+1)}
        >
          다음
        </button>
      </nav>
    `}}W=new WeakMap,_t=new WeakMap,wt=new WeakMap,At=new WeakMap,rt=new WeakMap,S=new WeakSet,Ye=function(){return this.page!==void 0},$e=function(){return this.perPage>0?!Number.isFinite(this.total)||this.total<0?(d(this,At)||(c(this,At,!0),console.warn(`[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`)),0):Math.ceil(this.total/this.perPage):(d(this,wt)||(c(this,wt,!0),console.warn(`[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`)),0)},Qe=function(){const t=this.page??d(this,W),n=d(this,S,$e);if(Number.isInteger(t)&&t>=1&&t<=n)return t;const s=Number.isFinite(t)?Math.min(Math.max(Math.round(t),1),Math.max(n,1)):1;return d(this,_t)||(c(this,_t,!0),console.warn(d(this,S,Ye)?`[ns-pagination] page=${t} 가 1..${n} 범위를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`:`[ns-pagination] 현재 페이지 ${t} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${n})를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`)),s},Fs=function(t){if(!Number.isInteger(t)||t<1||t>d(this,S,$e)||t===l(this,S,Qe).call(this))return!1;d(this,S,Ye)||(c(this,W,t),this.requestUpdate());const n={page:t};return this.dispatchEvent(new CustomEvent("ns-page-change",{detail:n,bubbles:!0,composed:!0})),!0},ye=function(t,n){l(this,S,Fs).call(this,n)&&c(this,rt,{control:t,page:n})},ge([b({type:Number})],mt.prototype,"total"),ge([b({type:Number,attribute:"per-page"})],mt.prototype,"perPage"),ge([b({attribute:!1})],mt.prototype,"page"),ge([b({type:Number,attribute:"default-page"})],mt.prototype,"defaultPage"),O("ns-pagination",mt);const Xn=D`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    경계선과 스크롤을 호스트가 아니라 이 <nav> 가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이고, 0.2.0 까지 여기 있던
    border-right 는 Tailwind 를 쓰는 소비자 전부에서 지워지고 있었다.
    shadow 안의 요소에는 그 규칙이 닿지 못한다.

    overflow 를 함께 내리는 이유는 스크롤바와 경계선의 순서다. 경계선만
    내리면 스크롤바가 호스트 것이라 경계선 오른쪽에 생긴다. 같은 요소가
    둘을 가져야 스크롤바가 경계선 안쪽에 남아 0.2.0 과 같게 그려진다.

    배경은 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { background: … } 로 덮을 수 있는 자리를 남긴다.
  */
  nav {
    box-sizing: border-box;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
  }

  /*
    접힘 너비. 두 속성을 함께 보는 이유는 타이밍이다.

    customElements.define 은 모듈 평가 시점에 실행되므로 hydrateRoot 보다
    먼저다. 그 사이 구간에서는 엘리먼트가 이미 upgrade 돼 tokens.css 의
    :not(:defined) 예약이 떨어져 나갔는데, React 는 아직 open 을 설정하지
    않았다. [open] 만 보면 이 구간이 4rem 으로 그려지고 하이드레이션 직후
    벌어진다 — 예약이 없애려던 것과 같은 튐이 창만 좁아진 채 남는다.

    data-ns-open 은 서버 마크업부터 DOM 에 있고 React 가 open 을 끌 때 함께
    지우므로 두 속성이 어긋나지 않는다. 순수 HTML 소비자는 마크업에 open 을
    직접 쓰므로 data-ns-open 이 없어도 첫 짝이 걸린다.

    타임라인: upgrade 전에는 tokens.css 의 문서 예약이, upgrade 와 hydration
    사이에는 data-ns-open 이, hydration 이후에는 open 이 너비를 잡는다.
  */
  :host(:not([open]):not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
  }

  /*
    접힘 상태를 하위에 전달하는 통로.

    shadow 안에서는 조상을 볼 수 없고 :host-context() 는 Chromium 전용이라
    쓸 수 없다. ::slotted() 로 직계 자식에 커스텀 프로퍼티를 내려주면
    상속을 타고 nav-group 의 shadow 와 그 아래 nav-item 까지 도달한다.
  */
  ::slotted(ns-nav-group) {
    --ns-label-display: block;
  }

  /* 너비와 같은 구간을 겪는다. 여기서 [open] 만 보면 라벨이 깜빡인다. */
  :host(:not([open]):not([data-ns-open])) ::slotted(ns-nav-group) {
    --ns-label-display: none;
  }
`;var Jn=Object.defineProperty,Yn=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Jn(e,t,s),s};const Le=class Le extends M{constructor(){super(...arguments),this.open=!1}connectedCallback(){super.connectedCallback(),U()}render(){return k`<nav><slot></slot></nav>`}};Le.styles=Xn;let qt=Le;Yn([b({type:Boolean,reflect:!0})],qt.prototype,"open"),O("ns-sidebar",qt);const Qn=D`
  :host {
    display: block;
  }

  .bar {
    background: var(--ns-color-surface-hover);
    animation: pulse 2s cubic-bezier(.4, 0, .6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }

  /*
    맥박 애니메이션은 이 설정이 정확히 겨냥하는 종류다. 참고 구현에는 없었다.
    멈추기만 하고 색은 유지한다 — 자리를 차지한다는 정보는 남아야 한다.
  */
  @media (prefers-reduced-motion: reduce) {
    .bar { animation: none; }
  }
`;var Gn=Object.defineProperty,Ue=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Gn(e,t,s),s};const ti=new Set(["badge","control","panel","card","pill"]),ze=class ze extends M{constructor(){super(...arguments);g(this,be);this.width="100%",this.height="1rem",this.radius="control"}connectedCallback(){super.connectedCallback(),U()}render(){return k`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${l(this,be,Vs).call(this)}"
      ></div>
    `}};be=new WeakSet,Vs=function(){return ti.has(this.radius)?`var(--ns-radius-${this.radius})`:this.radius},ze.styles=Qn;let st=ze;Ue([b({type:String})],st.prototype,"width"),Ue([b({type:String})],st.prototype,"height"),Ue([b({type:String})],st.prototype,"radius"),O("ns-skeleton",st);var ei=Object.defineProperty,Kt=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&ei(e,t,s),s};function si(i){return i==="none"?"ascending":i==="ascending"?"descending":"none"}class nt extends B{constructor(){super(...arguments);g(this,u);g(this,at);g(this,lt);g(this,ct);g(this,kt);g(this,Ct);g(this,xt);this.defaultSortKey="",this.defaultSortDirection="none",c(this,at,""),c(this,lt,"none"),c(this,kt,!1),c(this,xt,t=>{const n=t.target,s=n==null?void 0:n.closest('input[type="checkbox"][data-ns-select-all], input[type="checkbox"][data-ns-row-id]');if(s&&l(this,u,Ot).call(this,s)){l(this,u,Ys).call(this,s);return}const o=n==null?void 0:n.closest("th[data-ns-sort-key]");if(!o||!l(this,u,Ot).call(this,o))return;const r=o.dataset.nsSortKey??"",a=r===d(this,u,Ge)?si(d(this,u,ts)):"ascending",h=a==="none"?"":r;d(this,u,Ws)||(c(this,at,h),c(this,lt,a),this.requestUpdate());const v={key:h,direction:a};this.dispatchEvent(new CustomEvent("ns-sort",{detail:v,bubbles:!0,composed:!0}))})}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),Lt(this,{"sort-key":"default-sort-key","sort-direction":"default-sort-direction",selected:"각 행 checkbox 의 checked 속성"}),this.addEventListener("click",d(this,xt)),c(this,Ct,new MutationObserver(()=>{l(this,u,es).call(this),l(this,u,ie).call(this),l(this,u,Js).call(this)})),d(this,Ct).observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var t;this.removeEventListener("click",d(this,xt)),(t=d(this,Ct))==null||t.disconnect(),super.disconnectedCallback()}firstUpdated(){this.defaultSortKey!==""&&c(this,at,this.defaultSortKey),this.defaultSortDirection!=="none"&&c(this,lt,this.defaultSortDirection),this.selected===void 0&&c(this,ct,l(this,u,ss).call(this))}updated(){l(this,u,Zs).call(this),l(this,u,es).call(this),l(this,u,ie).call(this)}}at=new WeakMap,lt=new WeakMap,ct=new WeakMap,kt=new WeakMap,Ct=new WeakMap,u=new WeakSet,Ws=function(){return this.sortKey!==void 0},Ge=function(){return this.sortKey??d(this,at)},ts=function(){return this.sortDirection??d(this,lt)},Zs=function(){d(this,kt)||this.sortDirection===void 0||this.sortKey!==void 0||(c(this,kt,!0),console.warn(`[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`))},Ot=function(t){return t.closest("ns-table")===this},es=function(){const t=d(this,u,Ge),n=d(this,u,ts);for(const s of this.querySelectorAll("th[data-ns-sort-key]"))l(this,u,Ot).call(this,s)&&(s.dataset.nsSortKey===t&&n!=="none"?s.setAttribute("aria-sort",n):s.removeAttribute("aria-sort"))},xt=new WeakMap,_e=function(){return[...this.querySelectorAll("input[data-ns-row-id]")].filter(t=>l(this,u,Ot).call(this,t))},dt=function(t){return t.dataset.nsRowId??""},ie=function(){const t=[...this.querySelectorAll("input[data-ns-select-all]")].filter(h=>l(this,u,Ot).call(this,h));if(t.length===0)return;const n=l(this,u,_e).call(this),s=this.selected,o=s===void 0?n.filter(h=>h.checked).length:n.filter(h=>s.includes(l(this,u,dt).call(this,h))).length,r=n.length>0&&o===n.length,a=o>0&&o<n.length;for(const h of t)h.checked=r,h.indeterminate=a},ss=function(){return l(this,u,_e).call(this).filter(t=>t.checked).map(t=>l(this,u,dt).call(this,t))},Xs=function(t,n){if(t.length!==n.length)return!1;const s=new Set(n);return t.every(o=>s.has(o))},Js=function(){if(this.selected!==void 0)return;const t=l(this,u,ss).call(this),n=d(this,ct);if(!(n!==void 0&&l(this,u,Xs).call(this,n,t))){if(n===void 0||this.ownerDocument.readyState==="loading"){c(this,ct,t);return}l(this,u,oe).call(this,t)}},oe=function(t){c(this,ct,t);const n={ids:t};this.dispatchEvent(new CustomEvent("ns-select-change",{detail:n,bubbles:!0,composed:!0}))},Ys=function(t){const n=l(this,u,_e).call(this);if(t.hasAttribute("data-ns-select-all")){if(this.selected===void 0)for(const a of n)a.checked=t.checked;l(this,u,oe).call(this,t.checked?n.map(a=>l(this,u,dt).call(this,a)):[]),this.selected===void 0&&l(this,u,ie).call(this);return}if(!t.hasAttribute("data-ns-row-id"))return;let s;if(this.selected===void 0){s=n.filter(a=>a.checked).map(a=>l(this,u,dt).call(this,a)),l(this,u,oe).call(this,s),l(this,u,ie).call(this);return}const o=new Set(this.selected),r=l(this,u,dt).call(this,t);t.checked?o.add(r):o.delete(r),s=n.map(a=>l(this,u,dt).call(this,a)).filter(a=>o.has(a)),l(this,u,oe).call(this,s)},Kt([b({attribute:!1})],nt.prototype,"sortKey"),Kt([b({attribute:!1})],nt.prototype,"sortDirection"),Kt([b({type:String,attribute:"default-sort-key"})],nt.prototype,"defaultSortKey"),Kt([b({type:String,attribute:"default-sort-direction"})],nt.prototype,"defaultSortDirection"),Kt([b({attribute:!1})],nt.prototype,"selected"),O("ns-table",nt);var ni=Object.defineProperty,Ns=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&ni(e,t,s),s};function Rs(i){return`${i}-tab`}class ve extends B{constructor(){super(...arguments);g(this,y);g(this,ht);g(this,St);g(this,Et);g(this,Pt);g(this,Mt);this.defaultActive="",c(this,ht,""),c(this,Et,!1),c(this,Pt,t=>{const n=l(this,y,as).call(this,t.target);n!==null&&l(this,y,os).call(this,l(this,y,ut).call(this,n),!1)}),c(this,Mt,t=>{const n=l(this,y,as).call(this,t.target);if(n===null)return;const s=d(this,y,re),o=s.indexOf(n);if(o===-1)return;const r=a=>{t.preventDefault(),l(this,y,os).call(this,l(this,y,ut).call(this,s[(a+s.length)%s.length]),!0)};t.key==="ArrowRight"?r(o+1):t.key==="ArrowLeft"?r(o-1):t.key==="Home"?r(0):t.key==="End"&&r(s.length-1)})}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),Lt(this,{active:"default-active"}),this.hasAttribute("role")||this.setAttribute("role","tablist"),this.addEventListener("click",d(this,Pt)),this.addEventListener("keydown",d(this,Mt)),c(this,St,new MutationObserver(()=>l(this,y,we).call(this))),d(this,St).observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var t;this.removeEventListener("click",d(this,Pt)),this.removeEventListener("keydown",d(this,Mt)),(t=d(this,St))==null||t.disconnect(),super.disconnectedCallback()}firstUpdated(){this.defaultActive!==""&&c(this,ht,this.defaultActive)}updated(){l(this,y,we).call(this)}}ht=new WeakMap,St=new WeakMap,Et=new WeakMap,y=new WeakSet,ns=function(){return this.active!==void 0},re=function(){return[...this.querySelectorAll("[data-ns-tab]")].filter(t=>t.closest("ns-tabs")===this)},ut=function(t){return t.dataset.nsTab??""},is=function(){const t=d(this,y,re);if(t.length===0)return"";const n=this.active??d(this,ht);if(t.some(o=>l(this,y,ut).call(this,o)===n))return n;const s=l(this,y,ut).call(this,t[0]);return n!==""&&!d(this,Et)&&(c(this,Et,!0),console.warn(d(this,y,ns)?`[ns-tabs] active="${n}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${s}" 을 표시하지만 그 탭을 눌러도 ns-tab-change 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.`:`[ns-tabs] 활성 탭 "${n}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${s}" 을 표시합니다. default-active 값이 data-ns-tab 과 맞는지 확인하세요.`)),s},we=function(){const t=d(this,y,is);for(const n of d(this,y,re)){const s=l(this,y,ut).call(this,n),o=n.dataset.nsPanel??"";n.setAttribute("role","tab"),!n.hasAttribute("id")&&o!==""&&n.setAttribute("id",Rs(o)),o!==""&&n.setAttribute("aria-controls",o),n.setAttribute("aria-selected",s===t?"true":"false"),n.setAttribute("tabindex",s===t?"0":"-1")}},os=function(t,n){if(t==="")return;if(t===d(this,y,is)){n&&l(this,y,rs).call(this,t);return}d(this,y,ns)||(c(this,ht,t),this.requestUpdate());const s={id:t};this.dispatchEvent(new CustomEvent("ns-tab-change",{detail:s,bubbles:!0,composed:!0})),l(this,y,we).call(this),n&&l(this,y,rs).call(this,t)},rs=function(t){var n;(n=d(this,y,re).find(s=>l(this,y,ut).call(this,s)===t))==null||n.focus()},as=function(t){var s;const n=((s=t==null?void 0:t.closest)==null?void 0:s.call(t,"[data-ns-tab]"))??null;return n===null||n.closest("ns-tabs")!==this?null:n},Pt=new WeakMap,Mt=new WeakMap,Ns([b({attribute:!1})],ve.prototype,"active"),Ns([b({type:String,attribute:"default-active"})],ve.prototype,"defaultActive"),O("ns-tabs",ve);const ii=D`
  :host {
    position: fixed;
    /*
      **기본 자리(top-center)의 인셋을 :host 에도 둔다.** 아래 네 규칙 중 아무것도
      걸리지 않는 상태가 둘 있고, 인셋이 하나도 없는 fixed 상자는 정적 위치
      (문서 흐름에서 있었을 자리)에 남으므로 그 둘을 여기서 받는다.

      ⓐ connectedCallback ~ 첫 update() — Lit 이 속성을 첫 업데이트에서 반영하므로
         그 전에는 [position] 이 없다.
      ⓑ **범위 밖의 값.** 타입이 없는 UMD·순수 JS 소비자가 nsToastPosition("center-top")
         을 부르면 그 문자열이 그대로 반영돼 어느 규칙에도 걸리지 않는다.

      **upgrade 전 구간은 여기서 덮이지 않는다** — shadow root 가 없으면 이 규칙도
      없다. 그 구간은 애초에 그릴 내용이 없어 문제가 되지 않는다. 근거는 ns-toast.ts
      의 position 주석에 있다.
    */
    top: var(--ns-space-4);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
    /*
      **가운데 정렬에서 폭이 반토막 나는 것을 막는다.** width: auto 인 fixed 상자는
      shrink-to-fit 이고, 그때 "쓸 수 있는 폭" 은 컨테이닝 블록 폭에서 left 를 뺀
      값이다 — left: 50% 면 50vw 다. 좁은 화면에서 그 값이 .region 의 max-width
      보다 먼저 걸려 토스트가 화면 절반 폭으로 눌린다. max-content 는 그 계산에서
      빠지고, 넘치는 것은 .region 의 max-width 가 그대로 막는다.
    */
    width: max-content;
    /*
      **이 숫자를 올려도 열려 있는 모달 ns-dialog 를 이길 수 없다.** showModal() 은
      대화상자를 top layer 로 올리고, top layer 는 통상 스태킹 컨텍스트의 모든
      z-index 위에 있다 — 정수 하나로 닿는 곳이 아니다. 대화상자가 열린 채로 띄운
      토스트는 대화상자와 ::backdrop 뒤에 가려 보이지도 눌리지도 않는다.

      Popover API(showPopover)로 이 리전도 top layer 에 올릴 수 있지만 쓰지 않는다.
      이유는 하나, 브라우저 하한이다 — showPopover 는 Firefox 125+ 인데 이 패키지의
      문서화된 하한은 Firefox 121 이다.

      (UA 의 [popover] 규칙이 border·padding 을 넣는 것은 이유가 아니다.
      check-tokens.mjs 규칙 ④ 는 no-op 값을 면제하므로 :host { border: none;
      padding: 0 } 으로 되돌리면 통과한다.)

      해결은 문서다 — index.html 의 nsToast 절 "주의" 에 적혀 있다.
    */
    z-index: 1000;
    display: block;
    /* 토스트가 없는 동안 리전이 덮는 자리의 클릭을 가로채지 않는다. */
    pointer-events: none;
  }

  /*
    네 자리. **각 규칙이 인셋 넷과 transform 을 모두 적는다.** 자기에게 필요한
    것만 적고 나머지는 다른 규칙이 지워 주기를 기대하면 두 값이 함께 걸리고,
    규칙을 하나 더할 때 어느 쪽이 이기는지가 소스 순서로 조용히 바뀐다.
    .ns-accordion 이 --card/--plain 을 반드시 함께 쓰게 만든 것과 같은 판단이다.

    top-center 규칙은 위 :host 기본값과 값이 같다. 중복이지만 일부러 적는다 —
    네 자리가 한자리에 모여 있어야 대조할 수 있고, 기본값이 바뀌어도 이 규칙은
    자기 이름이 뜻하는 자리를 계속 가리킨다.
  */
  :host([position="top-center"]) {
    top: var(--ns-space-4);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="bottom-center"]) {
    top: auto;
    right: auto;
    bottom: var(--ns-space-4);
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="top-right"]) {
    top: var(--ns-space-4);
    right: var(--ns-space-4);
    bottom: auto;
    left: auto;
    transform: none;
  }

  :host([position="bottom-right"]) {
    top: auto;
    right: var(--ns-space-4);
    bottom: var(--ns-space-4);
    left: auto;
    transform: none;
  }

  .region {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
    /* 좁은 화면에서 화면 밖으로 나가지 않게 한다. */
    max-width: min(24rem, calc(100vw - var(--ns-space-8)));
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--ns-space-3);
    padding: var(--ns-space-3) var(--ns-space-4);
    border: 1px solid var(--ns-color-line);
    border-radius: var(--ns-radius-panel);
    background: var(--ns-color-surface);
    box-shadow: var(--ns-elevation-card);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    color: var(--ns-color-fg-body);
    /* :host 가 pointer-events 를 껐으므로 항목에서만 되살린다. */
    pointer-events: auto;
  }

  /*
    tone 은 메시지 앞의 작은 원점 하나로만 표현한다. 배경을 칠하면 글자 대비를
    다시 정해야 하고, 왼쪽 변을 두껍게 하면 상자 자체의 모양이 tone 마다 달라진다.

    **neutral 은 점을 아예 그리지 않는다.** 투명한 자리 채우기를 두지 않는다는
    뜻이기도 하다 — 그래서 neutral 토스트의 글자는 색 있는 것보다 (점 + gap)
    만큼 왼쪽에서 시작하고, 섞어 쌓으면 글자 시작점이 어긋난다. **의도한
    선택이다.** 없는 것을 자리로 주장하지 않는다.

    점은 장식이다. tone 은 danger 의 role="alert" 와 메시지 글자로 이미
    보조기술에 닿으므로 ns-toast.ts 가 aria-hidden 을 붙인다.

    첫 줄 글자의 세로 중앙에 맞춘다. .toast 가 align-items: flex-start 라 점이
    그대로 상자 맨 위에 붙는데, 여러 줄 메시지에서 그것이 첫 글자보다 위에
    뜬다. 줄 높이와 점 지름의 차이 절반만큼 내리면 첫 줄과 중심이 같아진다.
  */
  .dot {
    flex-shrink: 0;
    width: var(--ns-space-2);
    height: var(--ns-space-2);
    margin-top: calc((var(--ns-line-height-sm) - var(--ns-space-2)) / 2);
    border-radius: var(--ns-radius-pill);
  }

  .toast.success .dot { background: var(--ns-color-success); }
  .toast.danger  .dot { background: var(--ns-color-danger); }
  .toast.warn    .dot { background: var(--ns-color-warn); }

  .message {
    flex: 1;
    min-width: 0;
    /* 긴 메시지가 한 줄로 넘치지 않게 한다. */
    overflow-wrap: anywhere;
  }

  .close {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--ns-space-1);
    border: 0;
    border-radius: var(--ns-radius-control);
    background: none;
    color: var(--ns-color-fg-muted);
    cursor: pointer;
  }

  .close:hover {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  .close:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: 2px;
  }
`;var oi=Object.defineProperty,Ds=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&oi(e,t,s),s};const Ie=class Ie extends M{constructor(){super(...arguments);g(this,P);g(this,Gt);g(this,Z);g(this,H);g(this,X);g(this,te);g(this,ee);g(this,se);g(this,ne);this.position="top-center",this.items=[],c(this,Gt,0),c(this,Z,!1),c(this,H,!1),c(this,X,!1),c(this,te,()=>{c(this,Z,!0),l(this,P,Ut).call(this)}),c(this,ee,()=>{c(this,Z,!1),l(this,P,Ut).call(this)}),c(this,se,()=>{c(this,H,!0),l(this,P,Ut).call(this)}),c(this,ne,()=>{c(this,H,!1),l(this,P,Ut).call(this)})}connectedCallback(){super.connectedCallback(),U(),l(this,P,hs).call(this)}disconnectedCallback(){l(this,P,cs).call(this),c(this,Z,!1),c(this,H,!1),c(this,X,!1),super.disconnectedCallback()}show(t,n,s){const o=Bs(this,Gt)._++,r={key:o,message:t,tone:n,duration:s,remaining:s,startedAt:Date.now()};return this.items=[...this.items,r],d(this,X)||l(this,P,ls).call(this,r),()=>this.dismiss(o)}dismiss(t){const n=this.items.find(s=>s.key===t);n!==void 0&&(n.timer!==void 0&&clearTimeout(n.timer),this.items=this.items.filter(s=>s.key!==t))}updated(){var t;c(this,H,((t=this.shadowRoot)==null?void 0:t.activeElement)!=null),l(this,P,Ut).call(this)}render(){return k`
      <div
        class="region"
        aria-live="polite"
        @mousemove=${d(this,te)}
        @mouseleave=${d(this,ee)}
        @focusin=${d(this,se)}
        @focusout=${d(this,ne)}
      >
        ${pe(this.items,t=>t.key,t=>k`
            <div class="toast ${t.tone}" role=${t.tone==="danger"?"alert":_}>
              ${t.tone==="neutral"?_:k`<span class="dot" aria-hidden="true"></span>`}
              <span class="message">${t.message}</span>
              <button
                class="close"
                type="button"
                aria-label="닫기"
                @click=${()=>this.dismiss(t.key)}
              >
                <ns-icon name="close"></ns-icon>
              </button>
            </div>
          `)}
      </div>
    `}};Gt=new WeakMap,Z=new WeakMap,H=new WeakMap,X=new WeakMap,P=new WeakSet,ls=function(t){!Number.isFinite(t.duration)||t.duration<=0||t.timer!==void 0||(t.startedAt=Date.now(),t.timer=window.setTimeout(()=>this.dismiss(t.key),t.remaining))},cs=function(){for(const t of this.items)t.timer!==void 0&&(clearTimeout(t.timer),t.timer=void 0,t.remaining=Math.max(0,t.remaining-(Date.now()-t.startedAt)))},hs=function(){for(const t of this.items)l(this,P,ls).call(this,t)},Ut=function(){const t=d(this,Z)||d(this,H);t!==d(this,X)&&(c(this,X,t),t?l(this,P,cs).call(this):l(this,P,hs).call(this))},te=new WeakMap,ee=new WeakMap,se=new WeakMap,ne=new WeakMap,Ie.styles=ii;let $t=Ie;Ds([b({reflect:!0})],$t.prototype,"position"),Ds([Pe()],$t.prototype,"items"),O("ns-toast",$t);let js="top-center";function ri(){const i=document.querySelector("ns-toast");if(i!==null)return i;const e=document.createElement("ns-toast");return e.position=js,document.body.append(e),e}function ai(i){if(js=i,typeof document>"u")return;const e=document.querySelector("ns-toast");e!==null&&(e.position=i)}function li(i,e={}){if(typeof document>"u")return()=>{};const{tone:t="neutral",duration:n=4e3}=e;return ri().show(i,t,n)}function Hs(i,e,t){const n=document.activeElement,s=document.createElement("ns-dialog");s.heading=i.heading??"";const o=document.createElement("p");o.textContent=i.message,o.style.margin="0",s.append(o);let r=!1;const a=m=>{if(r)return;r=!0,s.close();const $=()=>{s.remove(),t(m),n instanceof HTMLElement&&n.isConnected&&n.focus()};s.updateComplete.then($,$)},h=async m=>{for(let $=0;$<5;$++)if(await s.updateComplete,r||(m.focus({preventScroll:!0}),document.activeElement===m))return;console.warn("[ns-confirm] 취소 버튼에 초기 포커스를 주지 못했습니다. ns-dialog 의 갱신 순서가 바뀌었을 수 있습니다.")},v=document.createElement("button");v.type="button",v.className=i.tone==="danger"?"ns-button ns-button--danger ns-button--sm":"ns-button ns-button--solid ns-button--sm",v.textContent=i.confirmLabel??"확인",v.addEventListener("click",()=>a(!0));const A=document.createElement("div");A.slot="footer";let p=null;if(e){const m=document.createElement("button");m.type="button",m.className="ns-button ns-button--outline ns-button--sm",m.textContent=i.cancelLabel??"취소",m.addEventListener("click",()=>a(!1)),i.tone==="danger"&&(p=m),A.append(m)}A.append(v),s.append(A),s.addEventListener("ns-dialog-close",()=>a(!1)),document.body.append(s),s.show(),p!==null&&h(p)}function ci(i){return typeof document>"u"?Promise.resolve():new Promise(e=>{Hs(i,!1,()=>e())})}function hi(i){return typeof document>"u"?Promise.resolve(!1):new Promise(e=>{Hs(i,!0,e)})}f.NsDialog=T,f.NsHeader=vt,f.NsIcon=zt,f.NsMultiSelect=N,f.NsNavGroup=Bt,f.NsNavItem=F,f.NsPageHeading=bt,f.NsPagination=mt,f.NsSidebar=qt,f.NsSkeleton=st,f.NsTable=nt,f.NsTabs=ve,f.NsToast=$t,f.nsAlert=ci,f.nsConfirm=hi,f.nsToast=li,f.nsToastPosition=ai,f.registerIcons=Cn,f.svg=he,f.tabIdFor=Rs,Object.defineProperty(f,Symbol.toStringTag,{value:"Module"})}));
