(function(g,_){typeof exports=="object"&&typeof module<"u"?_(exports):typeof define=="function"&&define.amd?define(["exports"],_):(g=typeof globalThis<"u"?globalThis:g||self,_(g.NsCommonUi={}))})(this,(function(g){"use strict";var Ge=g=>{throw TypeError(g)};var ge=(g,_,C)=>_.has(g)||Ge("Cannot "+C);var f=(g,_,C)=>(ge(g,_,"read from private field"),C?C.call(g):_.get(g)),v=(g,_,C)=>_.has(g)?Ge("Cannot add the same private member more than once"):_ instanceof WeakSet?_.add(g):_.set(g,C),c=(g,_,C,st)=>(ge(g,_,"write to private field"),st?st.call(g,C):_.set(g,C),C),d=(g,_,C)=>(ge(g,_,"access private method"),C);/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Ye,ht,J,ts,ve,U,X,D,A,$e,be,me,Pt,Ot,Mt,Ut,Tt,ye,Ft,Nt,Ht,z,ct,dt,ut,Y,k,_e,Wt,we,es,Zt,Vt,ss,Q,G,tt,pt,ft,h,is,Ae,ke,ns,$t,Se,gt,Jt,et,Rt,Ce,os,rs,jt,vt;const _=globalThis,C=_.ShadowRoot&&(_.ShadyCSS===void 0||_.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,st=Symbol(),xe=new WeakMap;let Ee=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==st)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(C&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=xe.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&xe.set(t,e))}return e}toString(){return this.cssText}};const as=n=>new Ee(typeof n=="string"?n:n+"",void 0,st),N=(n,...e)=>{const t=n.length===1?n[0]:e.reduce((i,s,o)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[o+1],n[0]);return new Ee(t,n,st)},ls=(n,e)=>{if(C)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=_.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,n.appendChild(i)}},Pe=C?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return as(t)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:hs,defineProperty:cs,getOwnPropertyDescriptor:ds,getOwnPropertyNames:us,getOwnPropertySymbols:ps,getPrototypeOf:fs}=Object,H=globalThis,Oe=H.trustedTypes,gs=Oe?Oe.emptyScript:"",Xt=H.reactiveElementPolyfillSupport,bt=(n,e)=>n,Dt={toAttribute(n,e){switch(e){case Boolean:n=n?gs:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},Yt=(n,e)=>!hs(n,e),Me={attribute:!0,type:String,converter:Dt,reflect:!1,useDefault:!1,hasChanged:Yt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),H.litPropertyMetadata??(H.litPropertyMetadata=new WeakMap);let B=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Me){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&cs(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:o}=ds(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:s,set(r){const l=s==null?void 0:s.call(this);o==null||o.call(this,r),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Me}static _$Ei(){if(this.hasOwnProperty(bt("elementProperties")))return;const e=fs(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(bt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(bt("properties"))){const t=this.properties,i=[...us(t),...ps(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(Pe(s))}else e!==void 0&&t.push(Pe(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ls(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostConnected)==null?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostDisconnected)==null?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){var o;const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const r=(((o=i.converter)==null?void 0:o.toAttribute)!==void 0?i.converter:Dt).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){var o,r;const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const l=i.getPropertyOptions(s),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((o=l.converter)==null?void 0:o.fromAttribute)!==void 0?l.converter:Dt;this._$Em=s;const u=a.fromAttribute(t,l.type);this[s]=u??((r=this._$Ej)==null?void 0:r.get(s))??u,this._$Em=null}}requestUpdate(e,t,i,s=!1,o){var r;if(e!==void 0){const l=this.constructor;if(s===!1&&(o=this[e]),i??(i=l.getPropertyOptions(e)),!((i.hasChanged??Yt)(o,t)||i.useDefault&&i.reflect&&o===((r=this._$Ej)==null?void 0:r.get(e))&&!this.hasAttribute(l._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,r??t??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[o,r]of s){const{wrapped:l}=r,a=this[o];l!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,r,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(i=this._$EO)==null||i.forEach(s=>{var o;return(o=s.hostUpdate)==null?void 0:o.call(s)}),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};B.elementStyles=[],B.shadowRootOptions={mode:"open"},B[bt("elementProperties")]=new Map,B[bt("finalized")]=new Map,Xt==null||Xt({ReactiveElement:B}),(H.reactiveElementVersions??(H.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const mt=globalThis,Ue=n=>n,zt=mt.trustedTypes,Te=zt?zt.createPolicy("lit-html",{createHTML:n=>n}):void 0,Ne="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,He="?"+R,vs=`<${He}>`,I=document,yt=()=>I.createComment(""),_t=n=>n===null||typeof n!="object"&&typeof n!="function",Qt=Array.isArray,$s=n=>Qt(n)||typeof(n==null?void 0:n[Symbol.iterator])=="function",Gt=`[ 	
\f\r]`,wt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Re=/-->/g,je=/>/g,L=RegExp(`>|${Gt}(?:([^\\s"'>=/]+)(${Gt}*=${Gt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),De=/'/g,ze=/"/g,Be=/^(?:script|style|textarea|title)$/i,Ie=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),x=Ie(1),Bt=Ie(2),q=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),Le=new WeakMap,K=I.createTreeWalker(I,129);function qe(n,e){if(!Qt(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Te!==void 0?Te.createHTML(e):e}const bs=(n,e)=>{const t=n.length-1,i=[];let s,o=e===2?"<svg>":e===3?"<math>":"",r=wt;for(let l=0;l<t;l++){const a=n[l];let u,w,p=-1,y=0;for(;y<a.length&&(r.lastIndex=y,w=r.exec(a),w!==null);)y=r.lastIndex,r===wt?w[1]==="!--"?r=Re:w[1]!==void 0?r=je:w[2]!==void 0?(Be.test(w[2])&&(s=RegExp("</"+w[2],"g")),r=L):w[3]!==void 0&&(r=L):r===L?w[0]===">"?(r=s??wt,p=-1):w[1]===void 0?p=-2:(p=r.lastIndex-w[2].length,u=w[1],r=w[3]===void 0?L:w[3]==='"'?ze:De):r===ze||r===De?r=L:r===Re||r===je?r=wt:(r=L,s=void 0);const b=r===L&&n[l+1].startsWith("/>")?" ":"";o+=r===wt?a+vs:p>=0?(i.push(u),a.slice(0,p)+Ne+a.slice(p)+R+b):a+R+(p===-2?l:b)}return[qe(n,o+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class At{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,r=0;const l=e.length-1,a=this.parts,[u,w]=bs(e,t);if(this.el=At.createElement(u,i),K.currentNode=this.el.content,t===2||t===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(s=K.nextNode())!==null&&a.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const p of s.getAttributeNames())if(p.endsWith(Ne)){const y=w[r++],b=s.getAttribute(p).split(R),S=/([.?@])?(.*)/.exec(y);a.push({type:1,index:o,name:S[2],strings:b,ctor:S[1]==="."?ys:S[1]==="?"?_s:S[1]==="@"?ws:It}),s.removeAttribute(p)}else p.startsWith(R)&&(a.push({type:6,index:o}),s.removeAttribute(p));if(Be.test(s.tagName)){const p=s.textContent.split(R),y=p.length-1;if(y>0){s.textContent=zt?zt.emptyScript:"";for(let b=0;b<y;b++)s.append(p[b],yt()),K.nextNode(),a.push({type:2,index:++o});s.append(p[y],yt())}}}else if(s.nodeType===8)if(s.data===He)a.push({type:2,index:o});else{let p=-1;for(;(p=s.data.indexOf(R,p+1))!==-1;)a.push({type:7,index:o}),p+=R.length-1}o++}}static createElement(e,t){const i=I.createElement("template");return i.innerHTML=e,i}}function it(n,e,t=n,i){var r,l;if(e===q)return e;let s=i!==void 0?(r=t._$Co)==null?void 0:r[i]:t._$Cl;const o=_t(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==o&&((l=s==null?void 0:s._$AO)==null||l.call(s,!1),o===void 0?s=void 0:(s=new o(n),s._$AT(n,t,i)),i!==void 0?(t._$Co??(t._$Co=[]))[i]=s:t._$Cl=s),s!==void 0&&(e=it(n,s._$AS(n,e.values),s,i)),e}class ms{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=((e==null?void 0:e.creationScope)??I).importNode(t,!0);K.currentNode=s;let o=K.nextNode(),r=0,l=0,a=i[0];for(;a!==void 0;){if(r===a.index){let u;a.type===2?u=new nt(o,o.nextSibling,this,e):a.type===1?u=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(u=new As(o,this,e)),this._$AV.push(u),a=i[++l]}r!==(a==null?void 0:a.index)&&(o=K.nextNode(),r++)}return K.currentNode=I,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class nt{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=it(this,e,t),_t(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==q&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):$s(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&_t(this._$AH)?this._$AA.nextSibling.data=e:this.T(I.createTextNode(e)),this._$AH=e}$(e){var o;const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=At.createElement(qe(i.h,i.h[0]),this.options)),i);if(((o=this._$AH)==null?void 0:o._$AD)===s)this._$AH.p(t);else{const r=new ms(s,this),l=r.u(this.options);r.p(t),this.T(l),this._$AH=r}}_$AC(e){let t=Le.get(e.strings);return t===void 0&&Le.set(e.strings,t=new At(e)),t}k(e){Qt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const o of e)s===t.length?t.push(i=new nt(this.O(yt()),this.O(yt()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,t);e!==this._$AB;){const s=Ue(e).nextSibling;Ue(e).remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class It{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,o){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=m}_$AI(e,t=this,i,s){const o=this.strings;let r=!1;if(o===void 0)e=it(this,e,t,0),r=!_t(e)||e!==this._$AH&&e!==q,r&&(this._$AH=e);else{const l=e;let a,u;for(e=o[0],a=0;a<o.length-1;a++)u=it(this,l[i+a],t,a),u===q&&(u=this._$AH[a]),r||(r=!_t(u)||u!==this._$AH[a]),u===m?e=m:e!==m&&(e+=(u??"")+o[a+1]),this._$AH[a]=u}r&&!s&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ys extends It{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}class _s extends It{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}}class ws extends It{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){if((e=it(this,e,t,0)??m)===q)return;const i=this._$AH,s=e===m&&i!==m||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==m&&(i===m||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class As{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){it(this,e)}}const ks={I:nt},te=mt.litHtmlPolyfillSupport;te==null||te(At,nt),(mt.litHtmlVersions??(mt.litHtmlVersions=[])).push("3.3.3");const Ss=(n,e,t)=>{const i=(t==null?void 0:t.renderBefore)??e;let s=i._$litPart$;if(s===void 0){const o=(t==null?void 0:t.renderBefore)??null;i._$litPart$=s=new nt(e.insertBefore(yt(),o),o,void 0,t??{})}return s._$AI(n),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const V=globalThis;let E=class extends B{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ss(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return q}};E._$litElement$=!0,E.finalized=!0,(Ye=V.litElementHydrateSupport)==null||Ye.call(V,{LitElement:E});const ee=V.litElementPolyfillSupport;ee==null||ee({LitElement:E}),(V.litElementVersions??(V.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Cs={attribute:!0,type:String,converter:Dt,reflect:!1,hasChanged:Yt},xs=(n=Cs,e,t)=>{const{kind:i,metadata:s}=t;let o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),i==="setter"&&((n=Object.create(n)).wrapped=!0),o.set(t.name,n),i==="accessor"){const{name:r}=t;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(r,a,n,!0,l)},init(l){return l!==void 0&&this.C(r,void 0,n,l),l}}}if(i==="setter"){const{name:r}=t;return function(l){const a=this[r];e.call(this,l),this.requestUpdate(r,a,n,!0,l)}}throw Error("Unsupported decorator location: "+i)};function $(n){return(e,t)=>typeof t=="object"?xs(n,e,t):((i,s,o)=>{const r=s.hasOwnProperty(o);return s.constructor.createProperty(o,i),r?Object.getOwnPropertyDescriptor(s,o):void 0})(n,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Es(n){return $({...n,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ps=(n,e,t)=>(t.configurable=!0,t.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(n,e,t),t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Os(n,e){return(t,i,s)=>{const o=r=>{var l;return((l=r.renderRoot)==null?void 0:l.querySelector(n))??null};return Ps(t,i,{get(){return o(this)}})}}function P(n,e){typeof window>"u"||!("customElements"in window)||customElements.get(n)||customElements.define(n,e)}let se=!1;const Ms=`[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`,Ke=()=>getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim()!=="";function O(){if(se||typeof document>"u"||typeof getComputedStyle>"u")return;if(Ke()){se=!0;return}se=!0;const n=()=>{Ke()||console.warn(Ms)};document.readyState==="complete"?n():window.addEventListener("load",n,{once:!0})}const Ve=new WeakMap;function ie(n,e){for(const[t,i]of Object.entries(e)){const s=[t,t.replaceAll("-","")].find(r=>n.hasAttribute(r));if(s===void 0)continue;let o=Ve.get(n);o===void 0&&Ve.set(n,o=new Set),!o.has(s)&&(o.add(s),console.warn(`[${n.localName}] ${s} 속성은 무시됩니다 — 이 이름은 프로퍼티 전용입니다.
  HTML 에서 쓸 것: ${i}
  JS 에서는 el.${Us(t)} 에 대입합니다.`))}}const Us=n=>n.replace(/-([a-z])/g,(e,t)=>t.toUpperCase()),Ts=N`
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
`,Lt={menu:{viewBox:"0 0 20 20",content:Bt`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},close:{viewBox:"0 0 20 20",content:Bt`
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},google:{viewBox:"0 0 18 18",content:Bt`
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
    `}};function Ns(n){Object.assign(Lt,n)}const Hs=N`
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
`;var Rs=Object.defineProperty,js=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&Rs(e,t,s),s};const re=class re extends E{constructor(){super(...arguments);v(this,J);v(this,ht);this.name="",c(this,ht,"")}connectedCallback(){super.connectedCallback(),O()}render(){return x`<slot>${d(this,J,ts).call(this)}</slot>`}updated(){var i;const t=((i=this.renderRoot.querySelector("slot"))==null?void 0:i.assignedNodes())??[];if(!t.some(s=>s.nodeType===Node.ELEMENT_NODE)){if(t.length>0){d(this,J,ve).call(this,`공백-${this.name}`,`[ns-icon] 공백만 든 자식이 슬롯을 채워 name="${this.name}" 폴백이 그려지지 않았다. <ns-icon name="${this.name}"></ns-icon> 처럼 안쪽을 붙여 쓴다.`);return}this.name!==""&&!Lt[this.name]&&d(this,J,ve).call(this,`없음-${this.name}`,`[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(Lt).join(", ")}. registerIcons() 로 더하거나, 자식으로 직접 넣는다 — <ns-icon><MyIcon /></ns-icon> 는 name 없이 동작한다.`)}}};ht=new WeakMap,J=new WeakSet,ts=function(){if(this.name==="")return m;const t=Lt[this.name];return t?x`<svg viewBox=${t.viewBox} fill="none" aria-hidden="true">${t.content}</svg>`:m},ve=function(t,i){f(this,ht)!==t&&(c(this,ht,t),console.warn(i))},re.styles=Hs;let kt=re;js([$({type:String})],kt.prototype,"name"),P("ns-icon",kt);var Ds=Object.defineProperty,ot=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&Ds(e,t,s),s};const ae=class ae extends E{constructor(){super(...arguments);v(this,A);v(this,U);v(this,X);v(this,D);v(this,Pt);v(this,Ot);v(this,Mt);v(this,Ut);v(this,Tt);this.heading="",this.defaultOpen=!1,this.noBackdropClose=!1,this.hasFooter=!1,c(this,U,!1),c(this,X,!1),c(this,D,!1),c(this,Pt,t=>{const i=t.target;this.hasFooter=i.assignedNodes({flatten:!0}).length>0}),c(this,Ot,()=>{if(f(this,D)){c(this,D,!1);return}d(this,A,Ft).call(this,"escape")}),c(this,Mt,()=>{d(this,A,Ft).call(this,"close-button")}),c(this,Ut,t=>{c(this,X,d(this,A,ye).call(this,t))}),c(this,Tt,t=>{const i=f(this,X);c(this,X,!1),!this.noBackdropClose&&t.detail!==0&&(!i||!d(this,A,ye).call(this,t)||d(this,A,Ft).call(this,"backdrop"))})}connectedCallback(){super.connectedCallback(),O(),ie(this,{open:"default-open"});const t=this.dialogEl;t!=null&&t.open&&(c(this,D,!0),t.close()),this.requestUpdate()}firstUpdated(){this.defaultOpen&&c(this,U,!0)}show(){d(this,A,me).call(this,"show")||(c(this,U,!0),this.requestUpdate())}close(){d(this,A,me).call(this,"close")||(c(this,U,!1),this.requestUpdate())}updated(){const t=this.dialogEl;t&&(f(this,A,be)&&!t.open?this.isConnected&&t.showModal():!f(this,A,be)&&t.open&&(c(this,D,!0),t.close()))}render(){return x`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${f(this,Ot)}
        @mousedown=${f(this,Ut)}
        @click=${f(this,Tt)}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${f(this,Mt)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${f(this,Pt)}></slot>
        </div>
      </dialog>
    `}};U=new WeakMap,X=new WeakMap,D=new WeakMap,A=new WeakSet,$e=function(){return this.open!==void 0},be=function(){return this.open??f(this,U)},me=function(t){return f(this,A,$e)?(console.warn(`[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${t}() 가 동작하지 않습니다. open 을 바꾸세요.`),!0):!1},Pt=new WeakMap,Ot=new WeakMap,Mt=new WeakMap,Ut=new WeakMap,Tt=new WeakMap,ye=function(t){const i=this.dialogEl;if(!i)return!1;const s=i.getBoundingClientRect();return t.clientX<s.left||t.clientX>s.right||t.clientY<s.top||t.clientY>s.bottom},Ft=function(t){f(this,A,$e)||c(this,U,!1);const i={reason:t};this.dispatchEvent(new CustomEvent("ns-dialog-close",{detail:i,bubbles:!0,composed:!0})),this.requestUpdate()},ae.styles=Ts;let M=ae;ot([$({type:String})],M.prototype,"heading"),ot([$({attribute:!1})],M.prototype,"open"),ot([$({type:Boolean,attribute:"default-open"})],M.prototype,"defaultOpen"),ot([$({type:Boolean,attribute:"no-backdrop-close"})],M.prototype,"noBackdropClose"),ot([Os("dialog")],M.prototype,"dialogEl"),ot([Es()],M.prototype,"hasFooter"),P("ns-dialog",M);const zs=N`
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
`;var Bs=Object.defineProperty,Fe=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&Bs(e,t,s),s};const le=class le extends E{constructor(){super(...arguments);v(this,Nt);this.projectName="",this.sidebarOpen=!1,c(this,Nt,()=>{const t={open:!this.sidebarOpen};this.dispatchEvent(new CustomEvent("ns-toggle",{detail:t,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),O()}render(){return x`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen?"true":"false"}
          aria-label=${this.sidebarOpen?"사이드바 닫기":"사이드바 열기"}
          @click=${f(this,Nt)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `}};Nt=new WeakMap,le.styles=zs;let rt=le;Fe([$({type:String,attribute:"project-name"})],rt.prototype,"projectName"),Fe([$({type:Boolean,reflect:!0,attribute:"sidebar-open"})],rt.prototype,"sidebarOpen"),P("ns-header",rt);const Is=N`
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
`;var Ls=Object.defineProperty,qs=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&Ls(e,t,s),s};const he=class he extends E{constructor(){super(...arguments),this.heading=""}connectedCallback(){super.connectedCallback(),O()}render(){return x`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `}};he.styles=Is;let St=he;qs([$({type:String})],St.prototype,"heading"),P("ns-nav-group",St);const Ks=N`
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

  :host([active]) .badge {
    background: var(--ns-color-accent);
    color: var(--ns-color-accent-fg);
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
`;var Vs=Object.defineProperty,qt=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&Vs(e,t,s),s};const ce=class ce extends E{constructor(){super(...arguments);v(this,Ht);this.href="",this.label="",this.badge="",this.active=!1,c(this,Ht,t=>{if(t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;t.preventDefault();const i={href:this.href,label:this.label};this.dispatchEvent(new CustomEvent("ns-navigate",{detail:i,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),O()}render(){return x`
      <a class="row" href=${this.href} title=${this.label} @click=${f(this,Ht)}>
        <span class="leading">
          <slot name="leading">
            <span class="badge" aria-hidden="true">${this.badge}</span>
          </slot>
        </span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `}};Ht=new WeakMap,ce.styles=Ks;let j=ce;qt([$({type:String})],j.prototype,"href"),qt([$({type:String})],j.prototype,"label"),qt([$({type:String})],j.prototype,"badge"),qt([$({type:Boolean,reflect:!0})],j.prototype,"active"),P("ns-nav-item",j);const Fs=N`
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
`;var Ws=Object.defineProperty,We=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&Ws(e,t,s),s};const de=class de extends E{constructor(){super(...arguments),this.heading="",this.description=""}connectedCallback(){super.connectedCallback(),O()}render(){return x`
      <h1>${this.heading}</h1>
      ${this.description?x`<p>${this.description}</p>`:m}
    `}};de.styles=Fs;let at=de;We([$({type:String})],at.prototype,"heading"),We([$({type:String})],at.prototype,"description"),P("ns-page-heading",at);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zs={CHILD:2},Js=n=>(...e)=>({_$litDirective$:n,values:e});let Xs=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{I:Ys}=ks,Ze=n=>n,Je=()=>document.createComment(""),Ct=(n,e,t)=>{var o;const i=n._$AA.parentNode,s=e===void 0?n._$AB:e._$AA;if(t===void 0){const r=i.insertBefore(Je(),s),l=i.insertBefore(Je(),s);t=new Ys(r,l,n,n.options)}else{const r=t._$AB.nextSibling,l=t._$AM,a=l!==n;if(a){let u;(o=t._$AQ)==null||o.call(t,n),t._$AM=n,t._$AP!==void 0&&(u=n._$AU)!==l._$AU&&t._$AP(u)}if(r!==s||a){let u=t._$AA;for(;u!==r;){const w=Ze(u).nextSibling;Ze(i).insertBefore(u,s),u=w}}}return t},F=(n,e,t=n)=>(n._$AI(e,t),n),Qs={},Gs=(n,e=Qs)=>n._$AH=e,ti=n=>n._$AH,ne=n=>{n._$AR(),n._$AA.remove()};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xe=(n,e,t)=>{const i=new Map;for(let s=e;s<=t;s++)i.set(n[s],s);return i},ei=Js(class extends Xs{constructor(n){if(super(n),n.type!==Zs.CHILD)throw Error("repeat() can only be used in text expressions")}dt(n,e,t){let i;t===void 0?t=e:e!==void 0&&(i=e);const s=[],o=[];let r=0;for(const l of n)s[r]=i?i(l,r):r,o[r]=t(l,r),r++;return{values:o,keys:s}}render(n,e,t){return this.dt(n,e,t).values}update(n,[e,t,i]){const s=ti(n),{values:o,keys:r}=this.dt(e,t,i);if(!Array.isArray(s))return this.ut=r,o;const l=this.ut??(this.ut=[]),a=[];let u,w,p=0,y=s.length-1,b=0,S=o.length-1;for(;p<=y&&b<=S;)if(s[p]===null)p++;else if(s[y]===null)y--;else if(l[p]===r[b])a[b]=F(s[p],o[b]),p++,b++;else if(l[y]===r[S])a[S]=F(s[y],o[S]),y--,S--;else if(l[p]===r[S])a[S]=F(s[p],o[S]),Ct(n,a[S+1],s[p]),p++,S--;else if(l[y]===r[b])a[b]=F(s[y],o[b]),Ct(n,s[p],s[y]),y--,b++;else if(u===void 0&&(u=Xe(r,b,S),w=Xe(l,p,y)),u.has(l[p]))if(u.has(l[y])){const T=w.get(r[b]),fe=T!==void 0?s[T]:null;if(fe===null){const Qe=Ct(n,s[p]);F(Qe,o[b]),a[b]=Qe}else a[b]=F(fe,o[b]),Ct(n,s[p],fe),s[T]=null;b++}else ne(s[y]),y--;else ne(s[p]),p++;for(;b<=S;){const T=Ct(n,a[S+1]);F(T,o[b]),a[b++]=T}for(;p<=y;){const T=s[p++];T!==null&&ne(T)}return this.ut=r,Gs(n,a),q}});var si=Object.defineProperty,Kt=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&si(e,t,s),s};function ii(n,e){if(e<=7)return Array.from({length:e},(o,r)=>r+1);const t=[1,n-1,n,n+1,e].filter(o=>o>=1&&o<=e).sort((o,r)=>o-r),i=[];let s=0;for(const o of t)o!==s&&(s!==0&&o-s>1&&i.push("gap"),i.push(o),s=o);return i}class lt extends E{constructor(){super(...arguments);v(this,k);v(this,z);v(this,ct);v(this,dt);v(this,ut);v(this,Y);this.total=0,this.perPage=20,this.defaultPage=1,c(this,z,1),c(this,ct,!1),c(this,dt,!1),c(this,ut,!1),c(this,Y,null)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),O(),ie(this,{page:"default-page"})}willUpdate(){if(!this.hasUpdated){if(!Number.isInteger(this.defaultPage)||this.defaultPage<1){console.warn(`[ns-pagination] default-page=${this.defaultPage} 는 1 이상의 정수여야 합니다. 1 페이지에서 시작합니다.`);return}this.defaultPage!==1&&c(this,z,this.defaultPage)}}updated(){var o;const t=f(this,Y);if(t===null||(c(this,Y,null),(this.page??f(this,z))!==t.page))return;const i=this.ownerDocument.activeElement;if(i!==null&&i!==this.ownerDocument.body&&!this.contains(i))return;const s=typeof t.control=="number"?`button[data-ns-page="${t.control}"]`:`button[data-ns-nav="${t.control}"]`;(o=this.querySelector(s))==null||o.focus()}render(){const t=f(this,k,Wt);if(t<=1)return m;const i=d(this,k,we).call(this);return x`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${i===1?"true":m}
          @click=${()=>d(this,k,Zt).call(this,"prev",i-1)}
        >
          이전
        </button>
        ${ei(ii(i,t),(s,o)=>s==="gap"?`gap-${o}`:s,s=>s==="gap"?x`<span class="ns-pagination-gap" aria-hidden="true">…</span>`:x`<button
                  class=${s===i?"ns-button ns-button--outline ns-button--sm":"ns-button ns-button--ghost ns-button--sm"}
                  type="button"
                  data-ns-page=${s}
                  aria-current=${s===i?"page":m}
                  @click=${()=>d(this,k,Zt).call(this,s,s)}
                >
                  ${s}
                </button>`)}
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${i===t?"true":m}
          @click=${()=>d(this,k,Zt).call(this,"next",i+1)}
        >
          다음
        </button>
      </nav>
    `}}z=new WeakMap,ct=new WeakMap,dt=new WeakMap,ut=new WeakMap,Y=new WeakMap,k=new WeakSet,_e=function(){return this.page!==void 0},Wt=function(){return this.perPage>0?!Number.isFinite(this.total)||this.total<0?(f(this,ut)||(c(this,ut,!0),console.warn(`[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`)),0):Math.ceil(this.total/this.perPage):(f(this,dt)||(c(this,dt,!0),console.warn(`[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`)),0)},we=function(){const t=this.page??f(this,z),i=f(this,k,Wt);if(Number.isInteger(t)&&t>=1&&t<=i)return t;const s=Number.isFinite(t)?Math.min(Math.max(Math.round(t),1),Math.max(i,1)):1;return f(this,ct)||(c(this,ct,!0),console.warn(f(this,k,_e)?`[ns-pagination] page=${t} 가 1..${i} 범위를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`:`[ns-pagination] 현재 페이지 ${t} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${i})를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`)),s},es=function(t){if(!Number.isInteger(t)||t<1||t>f(this,k,Wt)||t===d(this,k,we).call(this))return!1;f(this,k,_e)||(c(this,z,t),this.requestUpdate());const i={page:t};return this.dispatchEvent(new CustomEvent("ns-page-change",{detail:i,bubbles:!0,composed:!0})),!0},Zt=function(t,i){d(this,k,es).call(this,i)&&c(this,Y,{control:t,page:i})},Kt([$({type:Number})],lt.prototype,"total"),Kt([$({type:Number,attribute:"per-page"})],lt.prototype,"perPage"),Kt([$({attribute:!1})],lt.prototype,"page"),Kt([$({type:Number,attribute:"default-page"})],lt.prototype,"defaultPage"),P("ns-pagination",lt);const ni=N`
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
`;var oi=Object.defineProperty,ri=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&oi(e,t,s),s};const ue=class ue extends E{constructor(){super(...arguments),this.open=!1}connectedCallback(){super.connectedCallback(),O()}render(){return x`<nav><slot></slot></nav>`}};ue.styles=ni;let xt=ue;ri([$({type:Boolean,reflect:!0})],xt.prototype,"open"),P("ns-sidebar",xt);const ai=N`
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
`;var li=Object.defineProperty,oe=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&li(e,t,s),s};const hi=new Set(["badge","control","panel","card","pill"]),pe=class pe extends E{constructor(){super(...arguments);v(this,Vt);this.width="100%",this.height="1rem",this.radius="control"}connectedCallback(){super.connectedCallback(),O()}render(){return x`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${d(this,Vt,ss).call(this)}"
      ></div>
    `}};Vt=new WeakSet,ss=function(){return hi.has(this.radius)?`var(--ns-radius-${this.radius})`:this.radius},pe.styles=ai;let W=pe;oe([$({type:String})],W.prototype,"width"),oe([$({type:String})],W.prototype,"height"),oe([$({type:String})],W.prototype,"radius"),P("ns-skeleton",W);var ci=Object.defineProperty,Et=(n,e,t,i)=>{for(var s=void 0,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=r(e,t,s)||s);return s&&ci(e,t,s),s};function di(n){return n==="none"?"ascending":n==="ascending"?"descending":"none"}class Z extends B{constructor(){super(...arguments);v(this,h);v(this,Q);v(this,G);v(this,tt);v(this,pt);v(this,ft);v(this,gt);v(this,vt);this.defaultSortKey="",this.defaultSortDirection="none",c(this,Q,""),c(this,G,"none"),c(this,pt,!1),c(this,gt,t=>{const i=t.target,s=i==null?void 0:i.closest("th[data-ns-sort-key]");if(!s||!d(this,h,$t).call(this,s))return;const o=s.dataset.nsSortKey??"",r=o===f(this,h,Ae)?di(f(this,h,ke)):"ascending",l=r==="none"?"":o;f(this,h,is)||(c(this,Q,l),c(this,G,r),this.requestUpdate());const a={key:l,direction:r};this.dispatchEvent(new CustomEvent("ns-sort",{detail:a,bubbles:!0,composed:!0}))}),c(this,vt,t=>{var a;const i=(a=t.target)==null?void 0:a.closest('input[type="checkbox"]');if(!i||!d(this,h,$t).call(this,i))return;const s=d(this,h,Jt).call(this);if(i.hasAttribute("data-ns-select-all")){if(this.selected===void 0)for(const u of s)u.checked=i.checked;d(this,h,jt).call(this,i.checked?s.map(u=>d(this,h,et).call(this,u)):[]),this.selected===void 0&&d(this,h,Rt).call(this);return}if(!i.hasAttribute("data-ns-row-id"))return;let o;if(this.selected===void 0){o=s.filter(u=>u.checked).map(u=>d(this,h,et).call(this,u)),d(this,h,jt).call(this,o),d(this,h,Rt).call(this);return}const r=new Set(this.selected),l=d(this,h,et).call(this,i);i.checked?r.add(l):r.delete(l),o=s.map(u=>d(this,h,et).call(this,u)).filter(u=>r.has(u)),d(this,h,jt).call(this,o)})}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),O(),ie(this,{"sort-key":"default-sort-key","sort-direction":"default-sort-direction",selected:"각 행 checkbox 의 checked 속성"}),this.addEventListener("click",f(this,gt)),this.addEventListener("change",f(this,vt)),c(this,ft,new MutationObserver(()=>{d(this,h,Se).call(this),d(this,h,Rt).call(this),d(this,h,rs).call(this)})),f(this,ft).observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var t;this.removeEventListener("click",f(this,gt)),this.removeEventListener("change",f(this,vt)),(t=f(this,ft))==null||t.disconnect(),super.disconnectedCallback()}firstUpdated(){this.defaultSortKey!==""&&c(this,Q,this.defaultSortKey),this.defaultSortDirection!=="none"&&c(this,G,this.defaultSortDirection),this.selected===void 0&&c(this,tt,d(this,h,Ce).call(this))}updated(){d(this,h,ns).call(this),d(this,h,Se).call(this),d(this,h,Rt).call(this)}}Q=new WeakMap,G=new WeakMap,tt=new WeakMap,pt=new WeakMap,ft=new WeakMap,h=new WeakSet,is=function(){return this.sortKey!==void 0},Ae=function(){return this.sortKey??f(this,Q)},ke=function(){return this.sortDirection??f(this,G)},ns=function(){f(this,pt)||this.sortDirection===void 0||this.sortKey!==void 0||(c(this,pt,!0),console.warn(`[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`))},$t=function(t){return t.closest("ns-table")===this},Se=function(){const t=f(this,h,Ae),i=f(this,h,ke);for(const s of this.querySelectorAll("th[data-ns-sort-key]"))d(this,h,$t).call(this,s)&&s.setAttribute("aria-sort",s.dataset.nsSortKey===t?i:"none")},gt=new WeakMap,Jt=function(){return[...this.querySelectorAll("input[data-ns-row-id]")].filter(t=>d(this,h,$t).call(this,t))},et=function(t){return t.dataset.nsRowId??""},Rt=function(){const t=[...this.querySelectorAll("input[data-ns-select-all]")].filter(a=>d(this,h,$t).call(this,a));if(t.length===0)return;const i=d(this,h,Jt).call(this),s=this.selected,o=s===void 0?i.filter(a=>a.checked).length:i.filter(a=>s.includes(d(this,h,et).call(this,a))).length,r=i.length>0&&o===i.length,l=o>0&&o<i.length;for(const a of t)a.checked=r,a.indeterminate=l},Ce=function(){return d(this,h,Jt).call(this).filter(t=>t.checked).map(t=>d(this,h,et).call(this,t))},os=function(t,i){if(t.length!==i.length)return!1;const s=new Set(i);return t.every(o=>s.has(o))},rs=function(){if(this.selected!==void 0)return;const t=d(this,h,Ce).call(this),i=f(this,tt);if(!(i!==void 0&&d(this,h,os).call(this,i,t))){if(i===void 0||this.ownerDocument.readyState==="loading"){c(this,tt,t);return}d(this,h,jt).call(this,t)}},jt=function(t){c(this,tt,t);const i={ids:t};this.dispatchEvent(new CustomEvent("ns-select-change",{detail:i,bubbles:!0,composed:!0}))},vt=new WeakMap,Et([$({attribute:!1})],Z.prototype,"sortKey"),Et([$({attribute:!1})],Z.prototype,"sortDirection"),Et([$({type:String,attribute:"default-sort-key"})],Z.prototype,"defaultSortKey"),Et([$({type:String,attribute:"default-sort-direction"})],Z.prototype,"defaultSortDirection"),Et([$({attribute:!1})],Z.prototype,"selected"),P("ns-table",Z),g.NsDialog=M,g.NsHeader=rt,g.NsIcon=kt,g.NsNavGroup=St,g.NsNavItem=j,g.NsPageHeading=at,g.NsPagination=lt,g.NsSidebar=xt,g.NsSkeleton=W,g.NsTable=Z,g.registerIcons=Ns,g.svg=Bt,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})}));
