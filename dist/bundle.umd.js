(function(h,d){typeof exports=="object"&&typeof module<"u"?d(exports):typeof define=="function"&&define.amd?define(["exports"],d):(h=typeof globalThis<"u"?globalThis:h||self,d(h.NsCommonUi={}))})(this,(function(h){"use strict";var Ut=h=>{throw TypeError(h)};var Mt=(h,d,$)=>d.has(h)||Ut("Cannot "+$);var ht=(h,d,$)=>(Mt(h,d,"read from private field"),$?$.call(h):d.get(h)),ct=(h,d,$)=>d.has(h)?Ut("Cannot add the same private member more than once"):d instanceof WeakSet?d.add(h):d.set(h,$),dt=(h,d,$,x)=>(Mt(h,d,"write to private field"),x?x.call(h,$):d.set(h,$),$);/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Ot,B,I;const d=globalThis,$=d.ShadowRoot&&(d.ShadyCSS===void 0||d.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,x=Symbol(),pt=new WeakMap;let ut=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==x)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if($&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=pt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&pt.set(e,t))}return t}toString(){return this.cssText}};const Tt=r=>new ut(typeof r=="string"?r:r+"",void 0,x),V=(r,...t)=>{const e=r.length===1?r[0]:t.reduce((i,s,n)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[n+1],r[0]);return new ut(e,r,x)},Ht=(r,t)=>{if($)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const i=document.createElement("style"),s=d.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,r.appendChild(i)}},ft=$?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return Tt(e)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Nt,defineProperty:Rt,getOwnPropertyDescriptor:jt,getOwnPropertyNames:zt,getOwnPropertySymbols:Dt,getPrototypeOf:Lt}=Object,v=globalThis,$t=v.trustedTypes,Bt=$t?$t.emptyScript:"",X=v.reactiveElementPolyfillSupport,M=(r,t)=>r,q={toAttribute(r,t){switch(t){case Boolean:r=r?Bt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},Y=(r,t)=>!Nt(r,t),gt={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),v.litPropertyMetadata??(v.litPropertyMetadata=new WeakMap);let P=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=gt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&Rt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=jt(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:s,set(o){const l=s==null?void 0:s.call(this);n==null||n.call(this,o),this.requestUpdate(t,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??gt}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;const t=Lt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){const e=this.properties,i=[...zt(e),...Dt(e)];for(const s of i)this.createProperty(s,e[s])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)e.unshift(ft(s))}else t!==void 0&&e.push(ft(t));return e}static _$Eu(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ht(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostConnected)==null?void 0:i.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostDisconnected)==null?void 0:i.call(e)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){var n;const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const o=(((n=i.converter)==null?void 0:n.toAttribute)!==void 0?i.converter:q).toAttribute(e,i.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){var n,o;const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const l=i.getPropertyOptions(s),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((n=l.converter)==null?void 0:n.fromAttribute)!==void 0?l.converter:q;this._$Em=s;const p=a.fromAttribute(e,l.type);this[s]=p??((o=this._$Ej)==null?void 0:o.get(s))??p,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){var o;if(t!==void 0){const l=this.constructor;if(s===!1&&(n=this[t]),i??(i=l.getPropertyOptions(t)),!((i.hasChanged??Y)(n,e)||i.useDefault&&i.reflect&&n===((o=this._$Ej)==null?void 0:o.get(t))&&!this.hasAttribute(l._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},o){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[n,o]of this._$Ep)this[n]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[n,o]of s){const{wrapped:l}=o,a=this[n];l!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,o,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(i=this._$EO)==null||i.forEach(s=>{var n;return(n=s.hostUpdate)==null?void 0:n.call(s)}),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};P.elementStyles=[],P.shadowRootOptions={mode:"open"},P[M("elementProperties")]=new Map,P[M("finalized")]=new Map,X==null||X({ReactiveElement:P}),(v.reactiveElementVersions??(v.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const T=globalThis,vt=r=>r,W=T.trustedTypes,mt=W?W.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",m=`lit$${Math.random().toFixed(9).slice(2)}$`,yt="?"+m,It=`<${yt}>`,w=document,H=()=>w.createComment(""),N=r=>r===null||typeof r!="object"&&typeof r!="function",tt=Array.isArray,Vt=r=>tt(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",et=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,bt=/-->/g,At=/>/g,E=RegExp(`>|${et}(?:([^\\s"'>=/]+)(${et}*=${et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),wt=/'/g,Et=/"/g,St=/^(?:script|style|textarea|title)$/i,qt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),K=qt(1),k=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Ct=new WeakMap,S=w.createTreeWalker(w,129);function xt(r,t){if(!tt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return mt!==void 0?mt.createHTML(t):t}const Wt=(r,t)=>{const e=r.length-1,i=[];let s,n=t===2?"<svg>":t===3?"<math>":"",o=R;for(let l=0;l<e;l++){const a=r[l];let p,f,c=-1,g=0;for(;g<a.length&&(o.lastIndex=g,f=o.exec(a),f!==null);)g=o.lastIndex,o===R?f[1]==="!--"?o=bt:f[1]!==void 0?o=At:f[2]!==void 0?(St.test(f[2])&&(s=RegExp("</"+f[2],"g")),o=E):f[3]!==void 0&&(o=E):o===E?f[0]===">"?(o=s??R,c=-1):f[1]===void 0?c=-2:(c=o.lastIndex-f[2].length,p=f[1],o=f[3]===void 0?E:f[3]==='"'?Et:wt):o===Et||o===wt?o=E:o===bt||o===At?o=R:(o=E,s=void 0);const A=o===E&&r[l+1].startsWith("/>")?" ":"";n+=o===R?a+It:c>=0?(i.push(p),a.slice(0,c)+_t+a.slice(c)+m+A):a+m+(c===-2?l:A)}return[xt(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};class j{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const l=t.length-1,a=this.parts,[p,f]=Wt(t,e);if(this.el=j.createElement(p,i),S.currentNode=this.el.content,e===2||e===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(s=S.nextNode())!==null&&a.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const c of s.getAttributeNames())if(c.endsWith(_t)){const g=f[o++],A=s.getAttribute(c).split(m),Q=/([.?@])?(.*)/.exec(g);a.push({type:1,index:n,name:Q[2],strings:A,ctor:Q[1]==="."?Zt:Q[1]==="?"?Jt:Q[1]==="@"?Ft:Z}),s.removeAttribute(c)}else c.startsWith(m)&&(a.push({type:6,index:n}),s.removeAttribute(c));if(St.test(s.tagName)){const c=s.textContent.split(m),g=c.length-1;if(g>0){s.textContent=W?W.emptyScript:"";for(let A=0;A<g;A++)s.append(c[A],H()),S.nextNode(),a.push({type:2,index:++n});s.append(c[g],H())}}}else if(s.nodeType===8)if(s.data===yt)a.push({type:2,index:n});else{let c=-1;for(;(c=s.data.indexOf(m,c+1))!==-1;)a.push({type:7,index:n}),c+=m.length-1}n++}}static createElement(t,e){const i=w.createElement("template");return i.innerHTML=t,i}}function O(r,t,e=r,i){var o,l;if(t===k)return t;let s=i!==void 0?(o=e._$Co)==null?void 0:o[i]:e._$Cl;const n=N(t)?void 0:t._$litDirective$;return(s==null?void 0:s.constructor)!==n&&((l=s==null?void 0:s._$AO)==null||l.call(s,!1),n===void 0?s=void 0:(s=new n(r),s._$AT(r,e,i)),i!==void 0?(e._$Co??(e._$Co=[]))[i]=s:e._$Cl=s),s!==void 0&&(t=O(r,s._$AS(r,t.values),s,i)),t}class Kt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=((t==null?void 0:t.creationScope)??w).importNode(e,!0);S.currentNode=s;let n=S.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let p;a.type===2?p=new z(n,n.nextSibling,this,t):a.type===1?p=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(p=new Gt(n,this,t)),this._$AV.push(p),a=i[++l]}o!==(a==null?void 0:a.index)&&(n=S.nextNode(),o++)}return S.currentNode=w,s}p(t){let e=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class z{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=O(this,t,e),N(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==k&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Vt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&N(this._$AH)?this._$AA.nextSibling.data=t:this.T(w.createTextNode(t)),this._$AH=t}$(t){var n;const{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=j.createElement(xt(i.h,i.h[0]),this.options)),i);if(((n=this._$AH)==null?void 0:n._$AD)===s)this._$AH.p(e);else{const o=new Kt(s,this),l=o.u(this.options);o.p(e),this.T(l),this._$AH=o}}_$AC(t){let e=Ct.get(t.strings);return e===void 0&&Ct.set(t.strings,e=new j(t)),e}k(t){tt(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new z(this.O(H()),this.O(H()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,e);t!==this._$AB;){const s=vt(t).nextSibling;vt(t).remove(),t=s}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class Z{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=u}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(n===void 0)t=O(this,t,e,0),o=!N(t)||t!==this._$AH&&t!==k,o&&(this._$AH=t);else{const l=t;let a,p;for(t=n[0],a=0;a<n.length-1;a++)p=O(this,l[i+a],e,a),p===k&&(p=this._$AH[a]),o||(o=!N(p)||p!==this._$AH[a]),p===u?t=u:t!==u&&(t+=(p??"")+n[a+1]),this._$AH[a]=p}o&&!s&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Zt extends Z{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}}class Jt extends Z{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}}class Ft extends Z{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=O(this,t,e,0)??u)===k)return;const i=this._$AH,s=t===u&&i!==u||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==u&&(i===u||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class Gt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){O(this,t)}}const st=T.litHtmlPolyfillSupport;st==null||st(j,z),(T.litHtmlVersions??(T.litHtmlVersions=[])).push("3.3.3");const Qt=(r,t,e)=>{const i=(e==null?void 0:e.renderBefore)??t;let s=i._$litPart$;if(s===void 0){const n=(e==null?void 0:e.renderBefore)??null;i._$litPart$=s=new z(t.insertBefore(H(),n),n,void 0,e??{})}return s._$AI(r),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const C=globalThis;class _ extends P{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Qt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return k}}_._$litElement$=!0,_.finalized=!0,(Ot=C.litElementHydrateSupport)==null||Ot.call(C,{LitElement:_});const it=C.litElementPolyfillSupport;it==null||it({LitElement:_}),(C.litElementVersions??(C.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xt={attribute:!0,type:String,converter:q,reflect:!1,hasChanged:Y},Yt=(r=Xt,t,e)=>{const{kind:i,metadata:s}=e;let n=globalThis.litPropertyMetadata.get(s);if(n===void 0&&globalThis.litPropertyMetadata.set(s,n=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(e.name,r),i==="accessor"){const{name:o}=e;return{set(l){const a=t.get.call(this);t.set.call(this,l),this.requestUpdate(o,a,r,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,r,l),l}}}if(i==="setter"){const{name:o}=e;return function(l){const a=this[o];t.call(this,l),this.requestUpdate(o,a,r,!0,l)}}throw Error("Unsupported decorator location: "+i)};function y(r){return(t,e)=>typeof e=="object"?Yt(r,t,e):((i,s,n)=>{const o=s.hasOwnProperty(n);return s.constructor.createProperty(n,i),o?Object.getOwnPropertyDescriptor(s,n):void 0})(r,t,e)}function J(r,t){typeof window>"u"||!("customElements"in window)||customElements.get(r)||customElements.define(r,t)}let rt=!1;const te=`[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`,Pt=()=>getComputedStyle(document.documentElement).getPropertyValue("--color-line").trim()!=="";function F(){if(rt||typeof document>"u"||typeof getComputedStyle>"u")return;if(Pt()){rt=!0;return}rt=!0;const r=()=>{Pt()||console.warn(te)};document.readyState==="complete"?r():window.addEventListener("load",r,{once:!0})}const ee=V`
  :host {
    display: block;
    box-sizing: border-box;
    height: var(--header-height);
  }

  header {
    display: flex;
    height: 100%;
    align-items: center;
    gap: var(--space-3);
    border-bottom: 1px solid var(--color-line);
    background: var(--color-surface);
    padding-inline: var(--space-4);
  }

  .toggle {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-md);
    height: var(--control-height-md);
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-fg-body);
    cursor: pointer;
    transition: background-color var(--transition-fast) var(--transition-ease);
  }

  .toggle:hover {
    background: var(--color-surface-hover);
  }

  .title {
    font-weight: var(--weight-semibold);
    color: var(--color-fg);
  }

  /* margin-left: auto 가 남은 공간을 흡수해 actions 를 우측에 붙인다. */
  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
`;var se=Object.defineProperty,kt=(r,t,e,i)=>{for(var s=void 0,n=r.length-1,o;n>=0;n--)(o=r[n])&&(s=o(t,e,s)||s);return s&&se(t,e,s),s};const nt=class nt extends _{constructor(){super(...arguments);ct(this,B);this.projectName="",this.sidebarOpen=!1,dt(this,B,()=>{const e={open:!this.sidebarOpen};this.dispatchEvent(new CustomEvent("ns-toggle",{detail:e,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),F()}render(){return K`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen?"true":"false"}
          aria-label=${this.sidebarOpen?"사이드바 닫기":"사이드바 열기"}
          @click=${ht(this,B)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `}};B=new WeakMap,nt.styles=ee;let U=nt;kt([y({type:String,attribute:"project-name"})],U.prototype,"projectName"),kt([y({type:Boolean,reflect:!0,attribute:"sidebar-open"})],U.prototype,"sidebarOpen"),J("ns-header",U);const ie=V`
  :host {
    display: block;
  }

  /*
    그룹 사이 간격. 원본은 .section + .section 이었지만 여기서는 형제가
    light DOM 의 호스트라 shadow 안에서 선택할 수 없다. ::slotted() 는
    결합자를 받지 않으므로 사이드바 쪽에서도 불가능하다. :host() 는
    복합 선택자를 받으므로 이 형태가 유일하게 동작한다.
  */
  :host(:not(:first-child)) {
    margin-top: var(--space-6);
  }

  .heading {
    display: var(--ns-label-display, block);
    padding: var(--space-4) var(--space-4) var(--space-2);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.05em;
    color: var(--color-fg-subtle);
  }

  .list {
    padding: var(--space-2);
  }
`;var re=Object.defineProperty,ne=(r,t,e,i)=>{for(var s=void 0,n=r.length-1,o;n>=0;n--)(o=r[n])&&(s=o(t,e,s)||s);return s&&re(t,e,s),s};const ot=class ot extends _{constructor(){super(...arguments),this.heading=""}connectedCallback(){super.connectedCallback(),F()}render(){return K`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `}};ot.styles=ie;let D=ot;ne([y({type:String})],D.prototype,"heading"),J("ns-nav-group",D);const oe=V`
  :host {
    display: block;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--space-2-5);
    margin-bottom: var(--space-1);
    border-radius: var(--radius-control);
    padding: var(--space-2);
    color: var(--color-fg-body);
    text-decoration: none;
    transition: background-color var(--transition-fast) var(--transition-ease),
      color var(--transition-fast) var(--transition-ease);
  }

  .row:hover {
    background: var(--color-surface-sunken);
  }

  :host([active]) .row {
    background: var(--color-surface-hover);
    color: var(--color-fg);
  }

  /* 접힌 레일에서 유일하게 남는 요소라 flex 축소를 막는다. */
  .badge {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--control-height-sm);
    height: var(--control-height-sm);
    border-radius: var(--radius-badge);
    background: var(--color-surface-hover);
    font-size: var(--font-size-2xs);
    line-height: var(--line-height-2xs);
    font-weight: var(--weight-semibold);
  }

  :host([active]) .badge {
    background: var(--color-accent);
    color: var(--color-accent-fg);
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
    font-size: var(--font-size-sm);
    line-height: var(--line-height-sm);
    font-weight: var(--weight-medium);
  }

  .trailing {
    display: var(--ns-label-display, block);
    flex: none;
  }
`;var ae=Object.defineProperty,G=(r,t,e,i)=>{for(var s=void 0,n=r.length-1,o;n>=0;n--)(o=r[n])&&(s=o(t,e,s)||s);return s&&ae(t,e,s),s};const at=class at extends _{constructor(){super(...arguments);ct(this,I);this.href="",this.label="",this.badge="",this.active=!1,dt(this,I,e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();const i={href:this.href,label:this.label};this.dispatchEvent(new CustomEvent("ns-navigate",{detail:i,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),F()}render(){return K`
      <a class="row" href=${this.href} title=${this.label} @click=${ht(this,I)}>
        <span class="badge" aria-hidden="true">${this.badge}</span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `}};I=new WeakMap,at.styles=oe;let b=at;G([y({type:String})],b.prototype,"href"),G([y({type:String})],b.prototype,"label"),G([y({type:String})],b.prototype,"badge"),G([y({type:Boolean,reflect:!0})],b.prototype,"active"),J("ns-nav-item",b);const le=V`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--sidebar-width);
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--color-line);
    background: var(--color-surface);
    transition: width 200ms var(--transition-ease);
  }

  :host(:not([open])) {
    width: var(--sidebar-width-collapsed);
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

  :host(:not([open])) ::slotted(ns-nav-group) {
    --ns-label-display: none;
  }
`;var he=Object.defineProperty,ce=(r,t,e,i)=>{for(var s=void 0,n=r.length-1,o;n>=0;n--)(o=r[n])&&(s=o(t,e,s)||s);return s&&he(t,e,s),s};const lt=class lt extends _{constructor(){super(...arguments),this.open=!1}connectedCallback(){super.connectedCallback(),F()}render(){return K`<nav><slot></slot></nav>`}};lt.styles=le;let L=lt;ce([y({type:Boolean,reflect:!0})],L.prototype,"open"),J("ns-sidebar",L),h.NsHeader=U,h.NsNavGroup=D,h.NsNavItem=b,h.NsSidebar=L,Object.defineProperty(h,Symbol.toStringTag,{value:"Module"})}));
