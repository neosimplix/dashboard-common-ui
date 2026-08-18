(function(g,_){typeof exports=="object"&&typeof module<"u"?_(exports):typeof define=="function"&&define.amd?define(["exports"],_):(g=typeof globalThis<"u"?globalThis:g||self,_(g.NsCommonUi={}))})(this,(function(g){"use strict";var Je=g=>{throw TypeError(g)};var ue=(g,_,C)=>_.has(g)||Je("Cannot "+C);var f=(g,_,C)=>(ue(g,_,"read from private field"),C?C.call(g):_.get(g)),b=(g,_,C)=>_.has(g)?Je("Cannot add the same private member more than once"):_ instanceof WeakSet?_.add(g):_.set(g,C),c=(g,_,C,et)=>(ue(g,_,"write to private field"),et?et.call(g,C):_.set(g,C),C),p=(g,_,C)=>(ue(g,_,"access private method"),C);/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var We,lt,U,J,D,A,pe,fe,ge,Et,Pt,Ot,Mt,Ut,ve,qt,Tt,Ht,z,ht,ct,dt,X,S,$e,Kt,be,Xe,Vt,It,Ye,Y,Q,G,ut,pt,h,Qe,ye,me,Ge,vt,_e,ft,Ft,tt,Rt,we,ts,es,Nt,gt;const _=globalThis,C=_.ShadowRoot&&(_.ShadyCSS===void 0||_.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,et=Symbol(),Ae=new WeakMap;let Se=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(C&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=Ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Ae.set(t,e))}return e}toString(){return this.cssText}};const ss=n=>new Se(typeof n=="string"?n:n+"",void 0,et),H=(n,...e)=>{const t=n.length===1?n[0]:e.reduce((i,s,r)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[r+1],n[0]);return new Se(t,n,et)},is=(n,e)=>{if(C)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),s=_.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,n.appendChild(i)}},ke=C?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return ss(t)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:ns,defineProperty:rs,getOwnPropertyDescriptor:os,getOwnPropertyNames:as,getOwnPropertySymbols:ls,getPrototypeOf:hs}=Object,R=globalThis,Ce=R.trustedTypes,cs=Ce?Ce.emptyScript:"",Wt=R.reactiveElementPolyfillSupport,$t=(n,e)=>n,jt={toAttribute(n,e){switch(e){case Boolean:n=n?cs:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},Zt=(n,e)=>!ns(n,e),xe={attribute:!0,type:String,converter:jt,reflect:!1,useDefault:!1,hasChanged:Zt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),R.litPropertyMetadata??(R.litPropertyMetadata=new WeakMap);let B=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=xe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&rs(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=os(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:s,set(o){const l=s==null?void 0:s.call(this);r==null||r.call(this,o),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??xe}static _$Ei(){if(this.hasOwnProperty($t("elementProperties")))return;const e=hs(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty($t("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($t("properties"))){const t=this.properties,i=[...as(t),...ls(t)];for(const s of i)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const s of i)t.unshift(ke(s))}else e!==void 0&&t.push(ke(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return is(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostConnected)==null?void 0:i.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var i;return(i=t.hostDisconnected)==null?void 0:i.call(t)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){var r;const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){const o=(((r=i.converter)==null?void 0:r.toAttribute)!==void 0?i.converter:jt).toAttribute(t,i.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){var r,o;const i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const l=i.getPropertyOptions(s),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((r=l.converter)==null?void 0:r.fromAttribute)!==void 0?l.converter:jt;this._$Em=s;const d=a.fromAttribute(t,l.type);this[s]=d??((o=this._$Ej)==null?void 0:o.get(s))??d,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){var o;if(e!==void 0){const l=this.constructor;if(s===!1&&(r=this[e]),i??(i=l.getPropertyOptions(e)),!((i.hasChanged??Zt)(r,t)||i.useDefault&&i.reflect&&r===((o=this._$Ej)==null?void 0:o.get(e))&&!this.hasAttribute(l._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,o]of s){const{wrapped:l}=o,a=this[r];l!==!0||this._$AL.has(r)||a===void 0||this.C(r,void 0,o,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(i=this._$EO)==null||i.forEach(s=>{var r;return(r=s.hostUpdate)==null?void 0:r.call(s)}),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};B.elementStyles=[],B.shadowRootOptions={mode:"open"},B[$t("elementProperties")]=new Map,B[$t("finalized")]=new Map,Wt==null||Wt({ReactiveElement:B}),(R.reactiveElementVersions??(R.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const bt=globalThis,Ee=n=>n,Dt=bt.trustedTypes,Pe=Dt?Dt.createPolicy("lit-html",{createHTML:n=>n}):void 0,Oe="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,Me="?"+N,ds=`<${Me}>`,L=document,yt=()=>L.createComment(""),mt=n=>n===null||typeof n!="object"&&typeof n!="function",Jt=Array.isArray,us=n=>Jt(n)||typeof(n==null?void 0:n[Symbol.iterator])=="function",Xt=`[ 	
\f\r]`,_t=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ue=/-->/g,Te=/>/g,I=RegExp(`>|${Xt}(?:([^\\s"'>=/]+)(${Xt}*=${Xt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),He=/'/g,Re=/"/g,Ne=/^(?:script|style|textarea|title)$/i,je=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),E=je(1),Yt=je(2),q=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),De=new WeakMap,K=L.createTreeWalker(L,129);function ze(n,e){if(!Jt(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pe!==void 0?Pe.createHTML(e):e}const ps=(n,e)=>{const t=n.length-1,i=[];let s,r=e===2?"<svg>":e===3?"<math>":"",o=_t;for(let l=0;l<t;l++){const a=n[l];let d,w,u=-1,m=0;for(;m<a.length&&(o.lastIndex=m,w=o.exec(a),w!==null);)m=o.lastIndex,o===_t?w[1]==="!--"?o=Ue:w[1]!==void 0?o=Te:w[2]!==void 0?(Ne.test(w[2])&&(s=RegExp("</"+w[2],"g")),o=I):w[3]!==void 0&&(o=I):o===I?w[0]===">"?(o=s??_t,u=-1):w[1]===void 0?u=-2:(u=o.lastIndex-w[2].length,d=w[1],o=w[3]===void 0?I:w[3]==='"'?Re:He):o===Re||o===He?o=I:o===Ue||o===Te?o=_t:(o=I,s=void 0);const $=o===I&&n[l+1].startsWith("/>")?" ":"";r+=o===_t?a+ds:u>=0?(i.push(d),a.slice(0,u)+Oe+a.slice(u)+N+$):a+N+(u===-2?l:$)}return[ze(n,r+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class wt{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0;const l=e.length-1,a=this.parts,[d,w]=ps(e,t);if(this.el=wt.createElement(d,i),K.currentNode=this.el.content,t===2||t===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(s=K.nextNode())!==null&&a.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const u of s.getAttributeNames())if(u.endsWith(Oe)){const m=w[o++],$=s.getAttribute(u).split(N),k=/([.?@])?(.*)/.exec(m);a.push({type:1,index:r,name:k[2],strings:$,ctor:k[1]==="."?gs:k[1]==="?"?vs:k[1]==="@"?$s:zt}),s.removeAttribute(u)}else u.startsWith(N)&&(a.push({type:6,index:r}),s.removeAttribute(u));if(Ne.test(s.tagName)){const u=s.textContent.split(N),m=u.length-1;if(m>0){s.textContent=Dt?Dt.emptyScript:"";for(let $=0;$<m;$++)s.append(u[$],yt()),K.nextNode(),a.push({type:2,index:++r});s.append(u[m],yt())}}}else if(s.nodeType===8)if(s.data===Me)a.push({type:2,index:r});else{let u=-1;for(;(u=s.data.indexOf(N,u+1))!==-1;)a.push({type:7,index:r}),u+=N.length-1}r++}}static createElement(e,t){const i=L.createElement("template");return i.innerHTML=e,i}}function st(n,e,t=n,i){var o,l;if(e===q)return e;let s=i!==void 0?(o=t._$Co)==null?void 0:o[i]:t._$Cl;const r=mt(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==r&&((l=s==null?void 0:s._$AO)==null||l.call(s,!1),r===void 0?s=void 0:(s=new r(n),s._$AT(n,t,i)),i!==void 0?(t._$Co??(t._$Co=[]))[i]=s:t._$Cl=s),s!==void 0&&(e=st(n,s._$AS(n,e.values),s,i)),e}class fs{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=((e==null?void 0:e.creationScope)??L).importNode(t,!0);K.currentNode=s;let r=K.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let d;a.type===2?d=new it(r,r.nextSibling,this,e):a.type===1?d=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(d=new bs(r,this,e)),this._$AV.push(d),a=i[++l]}o!==(a==null?void 0:a.index)&&(r=K.nextNode(),o++)}return K.currentNode=L,s}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class it{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=st(this,e,t),mt(e)?e===y||e==null||e===""?(this._$AH!==y&&this._$AR(),this._$AH=y):e!==this._$AH&&e!==q&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):us(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==y&&mt(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){var r;const{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=wt.createElement(ze(i.h,i.h[0]),this.options)),i);if(((r=this._$AH)==null?void 0:r._$AD)===s)this._$AH.p(t);else{const o=new fs(s,this),l=o.u(this.options);o.p(t),this.T(l),this._$AH=o}}_$AC(e){let t=De.get(e.strings);return t===void 0&&De.set(e.strings,t=new wt(e)),t}k(e){Jt(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new it(this.O(yt()),this.O(yt()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,t);e!==this._$AB;){const s=Ee(e).nextSibling;Ee(e).remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class zt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=y}_$AI(e,t=this,i,s){const r=this.strings;let o=!1;if(r===void 0)e=st(this,e,t,0),o=!mt(e)||e!==this._$AH&&e!==q,o&&(this._$AH=e);else{const l=e;let a,d;for(e=r[0],a=0;a<r.length-1;a++)d=st(this,l[i+a],t,a),d===q&&(d=this._$AH[a]),o||(o=!mt(d)||d!==this._$AH[a]),d===y?e=y:e!==y&&(e+=(d??"")+r[a+1]),this._$AH[a]=d}o&&!s&&this.j(e)}j(e){e===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class gs extends zt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===y?void 0:e}}class vs extends zt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==y)}}class $s extends zt{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=st(this,e,t,0)??y)===q)return;const i=this._$AH,s=e===y&&i!==y||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==y&&(i===y||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class bs{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){st(this,e)}}const ys={I:it},Qt=bt.litHtmlPolyfillSupport;Qt==null||Qt(wt,it),(bt.litHtmlVersions??(bt.litHtmlVersions=[])).push("3.3.3");const ms=(n,e,t)=>{const i=(t==null?void 0:t.renderBefore)??e;let s=i._$litPart$;if(s===void 0){const r=(t==null?void 0:t.renderBefore)??null;i._$litPart$=s=new it(e.insertBefore(yt(),r),r,void 0,t??{})}return s._$AI(n),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const V=globalThis;let x=class extends B{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ms(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return q}};x._$litElement$=!0,x.finalized=!0,(We=V.litElementHydrateSupport)==null||We.call(V,{LitElement:x});const Gt=V.litElementPolyfillSupport;Gt==null||Gt({LitElement:x}),(V.litElementVersions??(V.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _s={attribute:!0,type:String,converter:jt,reflect:!1,hasChanged:Zt},ws=(n=_s,e,t)=>{const{kind:i,metadata:s}=t;let r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),i==="setter"&&((n=Object.create(n)).wrapped=!0),r.set(t.name,n),i==="accessor"){const{name:o}=t;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(o,a,n,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,n,l),l}}}if(i==="setter"){const{name:o}=t;return function(l){const a=this[o];e.call(this,l),this.requestUpdate(o,a,n,!0,l)}}throw Error("Unsupported decorator location: "+i)};function v(n){return(e,t)=>typeof t=="object"?ws(n,e,t):((i,s,r)=>{const o=s.hasOwnProperty(r);return s.constructor.createProperty(r,i),o?Object.getOwnPropertyDescriptor(s,r):void 0})(n,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function As(n){return v({...n,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ss=(n,e,t)=>(t.configurable=!0,t.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(n,e,t),t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ks(n,e){return(t,i,s)=>{const r=o=>{var l;return((l=o.renderRoot)==null?void 0:l.querySelector(n))??null};return Ss(t,i,{get(){return r(this)}})}}function P(n,e){typeof window>"u"||!("customElements"in window)||customElements.get(n)||customElements.define(n,e)}let te=!1;const Cs=`[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`,Be=()=>getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim()!=="";function O(){if(te||typeof document>"u"||typeof getComputedStyle>"u")return;if(Be()){te=!0;return}te=!0;const n=()=>{Be()||console.warn(Cs)};document.readyState==="complete"?n():window.addEventListener("load",n,{once:!0})}const xs=H`
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
`,Le={menu:{viewBox:"0 0 20 20",content:Yt`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},close:{viewBox:"0 0 20 20",content:Yt`
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},google:{viewBox:"0 0 18 18",content:Yt`
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
    `}},Es=H`
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
`;var Ps=Object.defineProperty,Os=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Ps(e,t,s),s};const ie=class ie extends x{constructor(){super(...arguments);b(this,lt);this.name="",c(this,lt,"")}connectedCallback(){super.connectedCallback(),O()}render(){if(this.name==="")return y;const t=Le[this.name];return t?E`<svg viewBox=${t.viewBox} fill="none" aria-hidden="true">${t.content}</svg>`:(this.name!==f(this,lt)&&(c(this,lt,this.name),console.warn(`[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys(Le).join(", ")}`)),y)}};lt=new WeakMap,ie.styles=Es;let At=ie;Os([v({type:String})],At.prototype,"name"),P("ns-icon",At);var Ms=Object.defineProperty,nt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Ms(e,t,s),s};const ne=class ne extends x{constructor(){super(...arguments);b(this,A);b(this,U);b(this,J);b(this,D);b(this,Et);b(this,Pt);b(this,Ot);b(this,Mt);b(this,Ut);this.heading="",this.defaultOpen=!1,this.noBackdropClose=!1,this.hasFooter=!1,c(this,U,!1),c(this,J,!1),c(this,D,!1),c(this,Et,t=>{const i=t.target;this.hasFooter=i.assignedNodes({flatten:!0}).length>0}),c(this,Pt,()=>{if(f(this,D)){c(this,D,!1);return}p(this,A,qt).call(this,"escape")}),c(this,Ot,()=>{p(this,A,qt).call(this,"close-button")}),c(this,Mt,t=>{c(this,J,p(this,A,ve).call(this,t))}),c(this,Ut,t=>{const i=f(this,J);c(this,J,!1),!this.noBackdropClose&&t.detail!==0&&(!i||!p(this,A,ve).call(this,t)||p(this,A,qt).call(this,"backdrop"))})}connectedCallback(){super.connectedCallback(),O();const t=this.dialogEl;t!=null&&t.open&&(c(this,D,!0),t.close()),this.requestUpdate()}firstUpdated(){this.defaultOpen&&c(this,U,!0)}show(){p(this,A,ge).call(this,"show")||(c(this,U,!0),this.requestUpdate())}close(){p(this,A,ge).call(this,"close")||(c(this,U,!1),this.requestUpdate())}updated(){const t=this.dialogEl;t&&(f(this,A,fe)&&!t.open?this.isConnected&&t.showModal():!f(this,A,fe)&&t.open&&(c(this,D,!0),t.close()))}render(){return E`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${f(this,Pt)}
        @mousedown=${f(this,Mt)}
        @click=${f(this,Ut)}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${f(this,Ot)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${f(this,Et)}></slot>
        </div>
      </dialog>
    `}};U=new WeakMap,J=new WeakMap,D=new WeakMap,A=new WeakSet,pe=function(){return this.open!==void 0},fe=function(){return this.open??f(this,U)},ge=function(t){return f(this,A,pe)?(console.warn(`[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${t}() 가 동작하지 않습니다. open 을 바꾸세요.`),!0):!1},Et=new WeakMap,Pt=new WeakMap,Ot=new WeakMap,Mt=new WeakMap,Ut=new WeakMap,ve=function(t){const i=this.dialogEl;if(!i)return!1;const s=i.getBoundingClientRect();return t.clientX<s.left||t.clientX>s.right||t.clientY<s.top||t.clientY>s.bottom},qt=function(t){f(this,A,pe)||c(this,U,!1);const i={reason:t};this.dispatchEvent(new CustomEvent("ns-dialog-close",{detail:i,bubbles:!0,composed:!0})),this.requestUpdate()},ne.styles=xs;let M=ne;nt([v({type:String})],M.prototype,"heading"),nt([v({attribute:!1})],M.prototype,"open"),nt([v({type:Boolean,attribute:"default-open"})],M.prototype,"defaultOpen"),nt([v({type:Boolean,attribute:"no-backdrop-close"})],M.prototype,"noBackdropClose"),nt([ks("dialog")],M.prototype,"dialogEl"),nt([As()],M.prototype,"hasFooter"),P("ns-dialog",M);const Us=H`
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
`;var Ts=Object.defineProperty,Ie=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Ts(e,t,s),s};const re=class re extends x{constructor(){super(...arguments);b(this,Tt);this.projectName="",this.sidebarOpen=!1,c(this,Tt,()=>{const t={open:!this.sidebarOpen};this.dispatchEvent(new CustomEvent("ns-toggle",{detail:t,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),O()}render(){return E`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen?"true":"false"}
          aria-label=${this.sidebarOpen?"사이드바 닫기":"사이드바 열기"}
          @click=${f(this,Tt)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `}};Tt=new WeakMap,re.styles=Us;let rt=re;Ie([v({type:String,attribute:"project-name"})],rt.prototype,"projectName"),Ie([v({type:Boolean,reflect:!0,attribute:"sidebar-open"})],rt.prototype,"sidebarOpen"),P("ns-header",rt);const Hs=H`
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
    margin-top: var(--ns-space-6);
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
`;var Rs=Object.defineProperty,Ns=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Rs(e,t,s),s};const oe=class oe extends x{constructor(){super(...arguments),this.heading=""}connectedCallback(){super.connectedCallback(),O()}render(){return E`
      <div role="group" aria-label=${this.heading}>
        <div class="heading">${this.heading}</div>
        <div class="list"><slot></slot></div>
      </div>
    `}};oe.styles=Hs;let St=oe;Ns([v({type:String})],St.prototype,"heading"),P("ns-nav-group",St);const js=H`
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
`;var Ds=Object.defineProperty,Bt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Ds(e,t,s),s};const ae=class ae extends x{constructor(){super(...arguments);b(this,Ht);this.href="",this.label="",this.badge="",this.active=!1,c(this,Ht,t=>{if(t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;t.preventDefault();const i={href:this.href,label:this.label};this.dispatchEvent(new CustomEvent("ns-navigate",{detail:i,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),O()}render(){return E`
      <a class="row" href=${this.href} title=${this.label} @click=${f(this,Ht)}>
        <span class="leading">
          <slot name="leading">
            <span class="badge" aria-hidden="true">${this.badge}</span>
          </slot>
        </span>
        <span class="label">${this.label}</span>
        <span class="trailing"><slot name="trailing"></slot></span>
      </a>
    `}};Ht=new WeakMap,ae.styles=js;let j=ae;Bt([v({type:String})],j.prototype,"href"),Bt([v({type:String})],j.prototype,"label"),Bt([v({type:String})],j.prototype,"badge"),Bt([v({type:Boolean,reflect:!0})],j.prototype,"active"),P("ns-nav-item",j);const zs=H`
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
`;var Bs=Object.defineProperty,qe=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Bs(e,t,s),s};const le=class le extends x{constructor(){super(...arguments),this.heading="",this.description=""}connectedCallback(){super.connectedCallback(),O()}render(){return E`
      <h1>${this.heading}</h1>
      ${this.description?E`<p>${this.description}</p>`:y}
    `}};le.styles=zs;let ot=le;qe([v({type:String})],ot.prototype,"heading"),qe([v({type:String})],ot.prototype,"description"),P("ns-page-heading",ot);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ls={CHILD:2},Is=n=>(...e)=>({_$litDirective$:n,values:e});let qs=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{I:Ks}=ys,Ke=n=>n,Ve=()=>document.createComment(""),kt=(n,e,t)=>{var r;const i=n._$AA.parentNode,s=e===void 0?n._$AB:e._$AA;if(t===void 0){const o=i.insertBefore(Ve(),s),l=i.insertBefore(Ve(),s);t=new Ks(o,l,n,n.options)}else{const o=t._$AB.nextSibling,l=t._$AM,a=l!==n;if(a){let d;(r=t._$AQ)==null||r.call(t,n),t._$AM=n,t._$AP!==void 0&&(d=n._$AU)!==l._$AU&&t._$AP(d)}if(o!==s||a){let d=t._$AA;for(;d!==o;){const w=Ke(d).nextSibling;Ke(i).insertBefore(d,s),d=w}}}return t},F=(n,e,t=n)=>(n._$AI(e,t),n),Vs={},Fs=(n,e=Vs)=>n._$AH=e,Ws=n=>n._$AH,ee=n=>{n._$AR(),n._$AA.remove()};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Fe=(n,e,t)=>{const i=new Map;for(let s=e;s<=t;s++)i.set(n[s],s);return i},Zs=Is(class extends qs{constructor(n){if(super(n),n.type!==Ls.CHILD)throw Error("repeat() can only be used in text expressions")}dt(n,e,t){let i;t===void 0?t=e:e!==void 0&&(i=e);const s=[],r=[];let o=0;for(const l of n)s[o]=i?i(l,o):o,r[o]=t(l,o),o++;return{values:r,keys:s}}render(n,e,t){return this.dt(n,e,t).values}update(n,[e,t,i]){const s=Ws(n),{values:r,keys:o}=this.dt(e,t,i);if(!Array.isArray(s))return this.ut=o,r;const l=this.ut??(this.ut=[]),a=[];let d,w,u=0,m=s.length-1,$=0,k=r.length-1;for(;u<=m&&$<=k;)if(s[u]===null)u++;else if(s[m]===null)m--;else if(l[u]===o[$])a[$]=F(s[u],r[$]),u++,$++;else if(l[m]===o[k])a[k]=F(s[m],r[k]),m--,k--;else if(l[u]===o[k])a[k]=F(s[u],r[k]),kt(n,a[k+1],s[u]),u++,k--;else if(l[m]===o[$])a[$]=F(s[m],r[$]),kt(n,s[u],s[m]),m--,$++;else if(d===void 0&&(d=Fe(o,$,k),w=Fe(l,u,m)),d.has(l[u]))if(d.has(l[m])){const T=w.get(o[$]),de=T!==void 0?s[T]:null;if(de===null){const Ze=kt(n,s[u]);F(Ze,r[$]),a[$]=Ze}else a[$]=F(de,r[$]),kt(n,s[u],de),s[T]=null;$++}else ee(s[m]),m--;else ee(s[u]),u++;for(;$<=k;){const T=kt(n,a[k+1]);F(T,r[$]),a[$++]=T}for(;u<=m;){const T=s[u++];T!==null&&ee(T)}return this.ut=o,Fs(n,a),q}});var Js=Object.defineProperty,Lt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Js(e,t,s),s};function Xs(n,e){if(e<=7)return Array.from({length:e},(r,o)=>o+1);const t=[1,n-1,n,n+1,e].filter(r=>r>=1&&r<=e).sort((r,o)=>r-o),i=[];let s=0;for(const r of t)r!==s&&(s!==0&&r-s>1&&i.push("gap"),i.push(r),s=r);return i}class at extends x{constructor(){super(...arguments);b(this,S);b(this,z);b(this,ht);b(this,ct);b(this,dt);b(this,X);this.total=0,this.perPage=20,this.defaultPage=1,c(this,z,1),c(this,ht,!1),c(this,ct,!1),c(this,dt,!1),c(this,X,null)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),O()}willUpdate(){if(!this.hasUpdated){if(!Number.isInteger(this.defaultPage)||this.defaultPage<1){console.warn(`[ns-pagination] default-page=${this.defaultPage} 는 1 이상의 정수여야 합니다. 1 페이지에서 시작합니다.`);return}this.defaultPage!==1&&c(this,z,this.defaultPage)}}updated(){var r;const t=f(this,X);if(t===null||(c(this,X,null),(this.page??f(this,z))!==t.page))return;const i=this.ownerDocument.activeElement;if(i!==null&&i!==this.ownerDocument.body&&!this.contains(i))return;const s=typeof t.control=="number"?`button[data-ns-page="${t.control}"]`:`button[data-ns-nav="${t.control}"]`;(r=this.querySelector(s))==null||r.focus()}render(){const t=f(this,S,Kt);if(t<=1)return y;const i=p(this,S,be).call(this);return E`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${i===1?"true":y}
          @click=${()=>p(this,S,Vt).call(this,"prev",i-1)}
        >
          이전
        </button>
        ${Zs(Xs(i,t),(s,r)=>s==="gap"?`gap-${r}`:s,s=>s==="gap"?E`<span class="ns-pagination-gap" aria-hidden="true">…</span>`:E`<button
                  class=${s===i?"ns-button ns-button--outline ns-button--sm":"ns-button ns-button--ghost ns-button--sm"}
                  type="button"
                  data-ns-page=${s}
                  aria-current=${s===i?"page":y}
                  @click=${()=>p(this,S,Vt).call(this,s,s)}
                >
                  ${s}
                </button>`)}
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${i===t?"true":y}
          @click=${()=>p(this,S,Vt).call(this,"next",i+1)}
        >
          다음
        </button>
      </nav>
    `}}z=new WeakMap,ht=new WeakMap,ct=new WeakMap,dt=new WeakMap,X=new WeakMap,S=new WeakSet,$e=function(){return this.page!==void 0},Kt=function(){return this.perPage>0?!Number.isFinite(this.total)||this.total<0?(f(this,dt)||(c(this,dt,!0),console.warn(`[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`)),0):Math.ceil(this.total/this.perPage):(f(this,ct)||(c(this,ct,!0),console.warn(`[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`)),0)},be=function(){const t=this.page??f(this,z),i=f(this,S,Kt);if(Number.isInteger(t)&&t>=1&&t<=i)return t;const s=Number.isFinite(t)?Math.min(Math.max(Math.round(t),1),Math.max(i,1)):1;return f(this,ht)||(c(this,ht,!0),console.warn(f(this,S,$e)?`[ns-pagination] page=${t} 가 1..${i} 범위를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`:`[ns-pagination] 현재 페이지 ${t} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${i})를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`)),s},Xe=function(t){if(!Number.isInteger(t)||t<1||t>f(this,S,Kt)||t===p(this,S,be).call(this))return!1;f(this,S,$e)||(c(this,z,t),this.requestUpdate());const i={page:t};return this.dispatchEvent(new CustomEvent("ns-page-change",{detail:i,bubbles:!0,composed:!0})),!0},Vt=function(t,i){p(this,S,Xe).call(this,i)&&c(this,X,{control:t,page:i})},Lt([v({type:Number})],at.prototype,"total"),Lt([v({type:Number,attribute:"per-page"})],at.prototype,"perPage"),Lt([v({attribute:!1})],at.prototype,"page"),Lt([v({type:Number,attribute:"default-page"})],at.prototype,"defaultPage"),P("ns-pagination",at);const Ys=H`
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
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
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
`;var Qs=Object.defineProperty,Gs=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&Qs(e,t,s),s};const he=class he extends x{constructor(){super(...arguments),this.open=!1}connectedCallback(){super.connectedCallback(),O()}render(){return E`<nav><slot></slot></nav>`}};he.styles=Ys;let Ct=he;Gs([v({type:Boolean,reflect:!0})],Ct.prototype,"open"),P("ns-sidebar",Ct);const ti=H`
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
`;var ei=Object.defineProperty,se=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&ei(e,t,s),s};const si=new Set(["badge","control","panel","card","pill"]),ce=class ce extends x{constructor(){super(...arguments);b(this,It);this.width="100%",this.height="1rem",this.radius="control"}connectedCallback(){super.connectedCallback(),O()}render(){return E`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${p(this,It,Ye).call(this)}"
      ></div>
    `}};It=new WeakSet,Ye=function(){return si.has(this.radius)?`var(--ns-radius-${this.radius})`:this.radius},ce.styles=ti;let W=ce;se([v({type:String})],W.prototype,"width"),se([v({type:String})],W.prototype,"height"),se([v({type:String})],W.prototype,"radius"),P("ns-skeleton",W);var ii=Object.defineProperty,xt=(n,e,t,i)=>{for(var s=void 0,r=n.length-1,o;r>=0;r--)(o=n[r])&&(s=o(e,t,s)||s);return s&&ii(e,t,s),s};function ni(n){return n==="none"?"ascending":n==="ascending"?"descending":"none"}class Z extends B{constructor(){super(...arguments);b(this,h);b(this,Y);b(this,Q);b(this,G);b(this,ut);b(this,pt);b(this,ft);b(this,gt);this.defaultSortKey="",this.defaultSortDirection="none",c(this,Y,""),c(this,Q,"none"),c(this,ut,!1),c(this,ft,t=>{const i=t.target,s=i==null?void 0:i.closest("th[data-ns-sort-key]");if(!s||!p(this,h,vt).call(this,s))return;const r=s.dataset.nsSortKey??"",o=r===f(this,h,ye)?ni(f(this,h,me)):"ascending",l=o==="none"?"":r;f(this,h,Qe)||(c(this,Y,l),c(this,Q,o),this.requestUpdate());const a={key:l,direction:o};this.dispatchEvent(new CustomEvent("ns-sort",{detail:a,bubbles:!0,composed:!0}))}),c(this,gt,t=>{var a;const i=(a=t.target)==null?void 0:a.closest('input[type="checkbox"]');if(!i||!p(this,h,vt).call(this,i))return;const s=p(this,h,Ft).call(this);if(i.hasAttribute("data-ns-select-all")){if(this.selected===void 0)for(const d of s)d.checked=i.checked;p(this,h,Nt).call(this,i.checked?s.map(d=>p(this,h,tt).call(this,d)):[]),this.selected===void 0&&p(this,h,Rt).call(this);return}if(!i.hasAttribute("data-ns-row-id"))return;let r;if(this.selected===void 0){r=s.filter(d=>d.checked).map(d=>p(this,h,tt).call(this,d)),p(this,h,Nt).call(this,r),p(this,h,Rt).call(this);return}const o=new Set(this.selected),l=p(this,h,tt).call(this,i);i.checked?o.add(l):o.delete(l),r=s.map(d=>p(this,h,tt).call(this,d)).filter(d=>o.has(d)),p(this,h,Nt).call(this,r)})}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),O(),this.addEventListener("click",f(this,ft)),this.addEventListener("change",f(this,gt)),c(this,pt,new MutationObserver(()=>{p(this,h,_e).call(this),p(this,h,Rt).call(this),p(this,h,es).call(this)})),f(this,pt).observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var t;this.removeEventListener("click",f(this,ft)),this.removeEventListener("change",f(this,gt)),(t=f(this,pt))==null||t.disconnect(),super.disconnectedCallback()}firstUpdated(){this.defaultSortKey!==""&&c(this,Y,this.defaultSortKey),this.defaultSortDirection!=="none"&&c(this,Q,this.defaultSortDirection),this.selected===void 0&&c(this,G,p(this,h,we).call(this))}updated(){p(this,h,Ge).call(this),p(this,h,_e).call(this),p(this,h,Rt).call(this)}}Y=new WeakMap,Q=new WeakMap,G=new WeakMap,ut=new WeakMap,pt=new WeakMap,h=new WeakSet,Qe=function(){return this.sortKey!==void 0},ye=function(){return this.sortKey??f(this,Y)},me=function(){return this.sortDirection??f(this,Q)},Ge=function(){f(this,ut)||this.sortDirection===void 0||this.sortKey!==void 0||(c(this,ut,!0),console.warn(`[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`))},vt=function(t){return t.closest("ns-table")===this},_e=function(){const t=f(this,h,ye),i=f(this,h,me);for(const s of this.querySelectorAll("th[data-ns-sort-key]"))p(this,h,vt).call(this,s)&&s.setAttribute("aria-sort",s.dataset.nsSortKey===t?i:"none")},ft=new WeakMap,Ft=function(){return[...this.querySelectorAll("input[data-ns-row-id]")].filter(t=>p(this,h,vt).call(this,t))},tt=function(t){return t.dataset.nsRowId??""},Rt=function(){const t=[...this.querySelectorAll("input[data-ns-select-all]")].filter(a=>p(this,h,vt).call(this,a));if(t.length===0)return;const i=p(this,h,Ft).call(this),s=this.selected,r=s===void 0?i.filter(a=>a.checked).length:i.filter(a=>s.includes(p(this,h,tt).call(this,a))).length,o=i.length>0&&r===i.length,l=r>0&&r<i.length;for(const a of t)a.checked=o,a.indeterminate=l},we=function(){return p(this,h,Ft).call(this).filter(t=>t.checked).map(t=>p(this,h,tt).call(this,t))},ts=function(t,i){if(t.length!==i.length)return!1;const s=new Set(i);return t.every(r=>s.has(r))},es=function(){if(this.selected!==void 0)return;const t=p(this,h,we).call(this),i=f(this,G);if(!(i!==void 0&&p(this,h,ts).call(this,i,t))){if(i===void 0||this.ownerDocument.readyState==="loading"){c(this,G,t);return}p(this,h,Nt).call(this,t)}},Nt=function(t){c(this,G,t);const i={ids:t};this.dispatchEvent(new CustomEvent("ns-select-change",{detail:i,bubbles:!0,composed:!0}))},gt=new WeakMap,xt([v({attribute:!1})],Z.prototype,"sortKey"),xt([v({attribute:!1})],Z.prototype,"sortDirection"),xt([v({type:String,attribute:"default-sort-key"})],Z.prototype,"defaultSortKey"),xt([v({type:String,attribute:"default-sort-direction"})],Z.prototype,"defaultSortDirection"),xt([v({attribute:!1})],Z.prototype,"selected"),P("ns-table",Z),g.NsDialog=M,g.NsHeader=rt,g.NsIcon=At,g.NsNavGroup=St,g.NsNavItem=j,g.NsPageHeading=ot,g.NsPagination=at,g.NsSidebar=Ct,g.NsSkeleton=W,g.NsTable=Z,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})}));
