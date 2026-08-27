(function(g,_){typeof exports=="object"&&typeof module<"u"?_(exports):typeof define=="function"&&define.amd?define(["exports"],_):(g=typeof globalThis<"u"?globalThis:g||self,_(g.NsCommonUi={}))})(this,(function(g){"use strict";var tn=g=>{throw TypeError(g)};var ts=(g,_,C)=>_.has(g)||tn("Cannot "+C);var c=(g,_,C)=>(ts(g,_,"read from private field"),C?C.call(g):_.get(g)),p=(g,_,C)=>_.has(g)?tn("Cannot add the same private member more than once"):_ instanceof WeakSet?_.add(g):_.set(g,C),l=(g,_,C,L)=>(ts(g,_,"write to private field"),L?L.call(g,C):_.set(g,C),C),d=(g,_,C)=>(ts(g,_,"access private method"),C);var en=(g,_,C,L)=>({set _(be){l(g,_,be,C)},get _(){return c(g,_,L)}});/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Gs,Ct,at,sn,es,j,lt,W,S,ss,ns,is,Qt,te,ee,se,ne,os,Se,ie,oe,D,nn,rs,as,ct,St,dt,ht,on,ls,re,ae,V,Et,Pt,Mt,Ot,ut,k,cs,Ee,rn,ds,an,Pe,Ut,ke,ln,Ce,cn,pt,ft,gt,Tt,Nt,f,dn,hs,us,hn,Lt,ps,Dt,Me,vt,pe,fs,un,pn,fe,fn,bt,Rt,jt,m,gs,ge,mt,bs,Oe,vs,ms,ys,zt,Ht,le,Z,z,J,P,$s,ws,_s,It,ce,de,he,ue;const _=globalThis,C=_.ShadowRoot&&(_.ShadyCSS===void 0||_.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,L=Symbol(),be=new WeakMap;let xs=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==L)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(C&&e===void 0){const n=t!==void 0&&t.length===1;n&&(e=be.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&be.set(t,e))}return e}toString(){return this.cssText}};const gn=i=>new xs(typeof i=="string"?i:i+"",void 0,L),R=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((n,s,o)=>n+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[o+1],i[0]);return new xs(t,i,L)},bn=(i,e)=>{if(C)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const n=document.createElement("style"),s=_.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=t.cssText,i.appendChild(n)}},As=C?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return gn(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:vn,defineProperty:mn,getOwnPropertyDescriptor:yn,getOwnPropertyNames:$n,getOwnPropertySymbols:wn,getPrototypeOf:_n}=Object,I=globalThis,ks=I.trustedTypes,xn=ks?ks.emptyScript:"",Ue=I.reactiveElementPolyfillSupport,Bt=(i,e)=>i,ve={toAttribute(i,e){switch(e){case Boolean:i=i?xn:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},Te=(i,e)=>!vn(i,e),Cs={attribute:!0,type:String,converter:ve,reflect:!1,useDefault:!1,hasChanged:Te};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),I.litPropertyMetadata??(I.litPropertyMetadata=new WeakMap);let B=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Cs){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),s=this.getPropertyDescriptor(e,n,t);s!==void 0&&mn(this.prototype,e,s)}}static getPropertyDescriptor(e,t,n){const{get:s,set:o}=yn(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:s,set(r){const a=s==null?void 0:s.call(this);o==null||o.call(this,r),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Cs}static _$Ei(){if(this.hasOwnProperty(Bt("elementProperties")))return;const e=_n(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Bt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Bt("properties"))){const t=this.properties,n=[...$n(t),...wn(t)];for(const s of n)this.createProperty(s,t[s])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[n,s]of t)this.elementProperties.set(n,s)}this._$Eh=new Map;for(const[t,n]of this.elementProperties){const s=this._$Eu(t,n);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const s of n)t.unshift(As(s))}else e!==void 0&&t.push(As(e));return t}static _$Eu(e,t){const n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(t=>t(this))}addController(e){var t;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((t=e.hostConnected)==null||t.call(e))}removeController(e){var t;(t=this._$EO)==null||t.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return bn(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostConnected)==null?void 0:n.call(t)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(t=>{var n;return(n=t.hostDisconnected)==null?void 0:n.call(t)})}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){var o;const n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){const r=(((o=n.converter)==null?void 0:o.toAttribute)!==void 0?n.converter:ve).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){var o,r;const n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const a=n.getPropertyOptions(s),h=typeof a.converter=="function"?{fromAttribute:a.converter}:((o=a.converter)==null?void 0:o.fromAttribute)!==void 0?a.converter:ve;this._$Em=s;const b=h.fromAttribute(t,a.type);this[s]=b??((r=this._$Ej)==null?void 0:r.get(s))??b,this._$Em=null}}requestUpdate(e,t,n,s=!1,o){var r;if(e!==void 0){const a=this.constructor;if(s===!1&&(o=this[e]),n??(n=a.getPropertyOptions(e)),!((n.hasChanged??Te)(o,t)||n.useDefault&&n.reflect&&o===((r=this._$Ej)==null?void 0:r.get(e))&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:s,wrapped:o},r){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,r??t??this[e]),o!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var n;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[o,r]of s){const{wrapped:a}=r,h=this[o];a!==!0||this._$AL.has(o)||h===void 0||this.C(o,void 0,r,h)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),(n=this._$EO)==null||n.forEach(s=>{var o;return(o=s.hostUpdate)==null?void 0:o.call(s)}),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){var t;(t=this._$EO)==null||t.forEach(n=>{var s;return(s=n.hostUpdated)==null?void 0:s.call(n)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(t=>this._$ET(t,this[t]))),this._$EM()}updated(e){}firstUpdated(e){}};B.elementStyles=[],B.shadowRootOptions={mode:"open"},B[Bt("elementProperties")]=new Map,B[Bt("finalized")]=new Map,Ue==null||Ue({ReactiveElement:B}),(I.reactiveElementVersions??(I.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const qt=globalThis,Ss=i=>i,me=qt.trustedTypes,Es=me?me.createPolicy("lit-html",{createHTML:i=>i}):void 0,Ps="$lit$",q=`lit$${Math.random().toFixed(9).slice(2)}$`,Ms="?"+q,An=`<${Ms}>`,X=document,Kt=()=>X.createComment(""),Ft=i=>i===null||typeof i!="object"&&typeof i!="function",Ne=Array.isArray,kn=i=>Ne(i)||typeof(i==null?void 0:i[Symbol.iterator])=="function",De=`[ 	
\f\r]`,Wt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Os=/-->/g,Us=/>/g,Y=RegExp(`>|${De}(?:([^\\s"'>=/]+)(${De}*=${De}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ts=/'/g,Ns=/"/g,Ds=/^(?:script|style|textarea|title)$/i,Rs=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),A=Rs(1),Vt=Rs(2),G=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),js=new WeakMap,Q=X.createTreeWalker(X,129);function zs(i,e){if(!Ne(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Es!==void 0?Es.createHTML(e):e}const Cn=(i,e)=>{const t=i.length-1,n=[];let s,o=e===2?"<svg>":e===3?"<math>":"",r=Wt;for(let a=0;a<t;a++){const h=i[a];let b,x,u=-1,$=0;for(;$<h.length&&(r.lastIndex=$,x=r.exec(h),x!==null);)$=r.lastIndex,r===Wt?x[1]==="!--"?r=Os:x[1]!==void 0?r=Us:x[2]!==void 0?(Ds.test(x[2])&&(s=RegExp("</"+x[2],"g")),r=Y):x[3]!==void 0&&(r=Y):r===Y?x[0]===">"?(r=s??Wt,u=-1):x[1]===void 0?u=-2:(u=r.lastIndex-x[2].length,b=x[1],r=x[3]===void 0?Y:x[3]==='"'?Ns:Ts):r===Ns||r===Ts?r=Y:r===Os||r===Us?r=Wt:(r=Y,s=void 0);const w=r===Y&&i[a+1].startsWith("/>")?" ":"";o+=r===Wt?h+An:u>=0?(n.push(b),h.slice(0,u)+Ps+h.slice(u)+q+w):h+q+(u===-2?a:w)}return[zs(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class Zt{constructor({strings:e,_$litType$:t},n){let s;this.parts=[];let o=0,r=0;const a=e.length-1,h=this.parts,[b,x]=Cn(e,t);if(this.el=Zt.createElement(b,n),Q.currentNode=this.el.content,t===2||t===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(s=Q.nextNode())!==null&&h.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(const u of s.getAttributeNames())if(u.endsWith(Ps)){const $=x[r++],w=s.getAttribute(u).split(q),E=/([.?@])?(.*)/.exec($);h.push({type:1,index:o,name:E[2],strings:w,ctor:E[1]==="."?En:E[1]==="?"?Pn:E[1]==="@"?Mn:ye}),s.removeAttribute(u)}else u.startsWith(q)&&(h.push({type:6,index:o}),s.removeAttribute(u));if(Ds.test(s.tagName)){const u=s.textContent.split(q),$=u.length-1;if($>0){s.textContent=me?me.emptyScript:"";for(let w=0;w<$;w++)s.append(u[w],Kt()),Q.nextNode(),h.push({type:2,index:++o});s.append(u[$],Kt())}}}else if(s.nodeType===8)if(s.data===Ms)h.push({type:2,index:o});else{let u=-1;for(;(u=s.data.indexOf(q,u+1))!==-1;)h.push({type:7,index:o}),u+=q.length-1}o++}}static createElement(e,t){const n=X.createElement("template");return n.innerHTML=e,n}}function yt(i,e,t=i,n){var r,a;if(e===G)return e;let s=n!==void 0?(r=t._$Co)==null?void 0:r[n]:t._$Cl;const o=Ft(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==o&&((a=s==null?void 0:s._$AO)==null||a.call(s,!1),o===void 0?s=void 0:(s=new o(i),s._$AT(i,t,n)),n!==void 0?(t._$Co??(t._$Co=[]))[n]=s:t._$Cl=s),s!==void 0&&(e=yt(i,s._$AS(i,e.values),s,n)),e}class Sn{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,s=((e==null?void 0:e.creationScope)??X).importNode(t,!0);Q.currentNode=s;let o=Q.nextNode(),r=0,a=0,h=n[0];for(;h!==void 0;){if(r===h.index){let b;h.type===2?b=new $t(o,o.nextSibling,this,e):h.type===1?b=new h.ctor(o,h.name,h.strings,this,e):h.type===6&&(b=new On(o,this,e)),this._$AV.push(b),h=n[++a]}r!==(h==null?void 0:h.index)&&(o=Q.nextNode(),r++)}return Q.currentNode=X,s}p(e){let t=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class $t{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,t,n,s){this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=yt(this,e,t),Ft(e)?e===y||e==null||e===""?(this._$AH!==y&&this._$AR(),this._$AH=y):e!==this._$AH&&e!==G&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):kn(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==y&&Ft(this._$AH)?this._$AA.nextSibling.data=e:this.T(X.createTextNode(e)),this._$AH=e}$(e){var o;const{values:t,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Zt.createElement(zs(n.h,n.h[0]),this.options)),n);if(((o=this._$AH)==null?void 0:o._$AD)===s)this._$AH.p(t);else{const r=new Sn(s,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=js.get(e.strings);return t===void 0&&js.set(e.strings,t=new Zt(e)),t}k(e){Ne(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,s=0;for(const o of e)s===t.length?t.push(n=new $t(this.O(Kt()),this.O(Kt()),this,this.options)):n=t[s],n._$AI(o),s++;s<t.length&&(this._$AR(n&&n._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var n;for((n=this._$AP)==null?void 0:n.call(this,!1,!0,t);e!==this._$AB;){const s=Ss(e).nextSibling;Ss(e).remove(),e=s}}setConnected(e){var t;this._$AM===void 0&&(this._$Cv=e,(t=this._$AP)==null||t.call(this,e))}}class ye{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,s,o){this.type=1,this._$AH=y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=y}_$AI(e,t=this,n,s){const o=this.strings;let r=!1;if(o===void 0)e=yt(this,e,t,0),r=!Ft(e)||e!==this._$AH&&e!==G,r&&(this._$AH=e);else{const a=e;let h,b;for(e=o[0],h=0;h<o.length-1;h++)b=yt(this,a[n+h],t,h),b===G&&(b=this._$AH[h]),r||(r=!Ft(b)||b!==this._$AH[h]),b===y?e=y:e!==y&&(e+=(b??"")+o[h+1]),this._$AH[h]=b}r&&!s&&this.j(e)}j(e){e===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class En extends ye{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===y?void 0:e}}class Pn extends ye{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==y)}}class Mn extends ye{constructor(e,t,n,s,o){super(e,t,n,s,o),this.type=5}_$AI(e,t=this){if((e=yt(this,e,t,0)??y)===G)return;const n=this._$AH,s=e===y&&n!==y||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==y&&(n===y||s);s&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t;typeof this._$AH=="function"?this._$AH.call(((t=this.options)==null?void 0:t.host)??this.element,e):this._$AH.handleEvent(e)}}class On{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){yt(this,e)}}const Un={I:$t},Re=qt.litHtmlPolyfillSupport;Re==null||Re(Zt,$t),(qt.litHtmlVersions??(qt.litHtmlVersions=[])).push("3.3.3");const Tn=(i,e,t)=>{const n=(t==null?void 0:t.renderBefore)??e;let s=n._$litPart$;if(s===void 0){const o=(t==null?void 0:t.renderBefore)??null;n._$litPart$=s=new $t(e.insertBefore(Kt(),o),o,void 0,t??{})}return s._$AI(i),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tt=globalThis;let M=class extends B{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Tn(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return G}};M._$litElement$=!0,M.finalized=!0,(Gs=tt.litElementHydrateSupport)==null||Gs.call(tt,{LitElement:M});const je=tt.litElementPolyfillSupport;je==null||je({LitElement:M}),(tt.litElementVersions??(tt.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Nn={attribute:!0,type:String,converter:ve,reflect:!1,hasChanged:Te},Dn=(i=Nn,e,t)=>{const{kind:n,metadata:s}=t;let o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),n==="setter"&&((i=Object.create(i)).wrapped=!0),o.set(t.name,i),n==="accessor"){const{name:r}=t;return{set(a){const h=e.get.call(this);e.set.call(this,a),this.requestUpdate(r,h,i,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,i,a),a}}}if(n==="setter"){const{name:r}=t;return function(a){const h=this[r];e.call(this,a),this.requestUpdate(r,h,i,!0,a)}}throw Error("Unsupported decorator location: "+n)};function v(i){return(e,t)=>typeof t=="object"?Dn(i,e,t):((n,s,o)=>{const r=s.hasOwnProperty(o);return s.constructor.createProperty(o,n),r?Object.getOwnPropertyDescriptor(s,o):void 0})(i,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ze(i){return v({...i,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Rn=(i,e,t)=>(t.configurable=!0,t.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(i,e,t),t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function jn(i,e){return(t,n,s)=>{const o=r=>{var a;return((a=r.renderRoot)==null?void 0:a.querySelector(i))??null};return Rn(t,n,{get(){return o(this)}})}}function O(i,e){typeof window>"u"||!("customElements"in window)||customElements.get(i)||customElements.define(i,e)}let He=!1;const zn=`[@neosimplix/common-ui] tokens.css 가 로드되지 않아 레이아웃이 깨집니다.
  Next/React:  import "@neosimplix/common-ui/tokens.css";
  HTML:        <link rel="stylesheet" href="…/dist/tokens.css">`,Hs=()=>getComputedStyle(document.documentElement).getPropertyValue("--ns-color-line").trim()!=="";function U(){if(He||typeof document>"u"||typeof getComputedStyle>"u")return;if(Hs()){He=!0;return}He=!0;const i=()=>{Hs()||console.warn(zn)};document.readyState==="complete"?i():window.addEventListener("load",i,{once:!0})}const Ls=new WeakMap;function et(i,e){for(const[t,n]of Object.entries(e)){const s=[t,t.replaceAll("-","")].find(r=>i.hasAttribute(r));if(s===void 0)continue;let o=Ls.get(i);o===void 0&&Ls.set(i,o=new Set),!o.has(s)&&(o.add(s),console.warn(`[${i.localName}] ${s} 속성은 무시됩니다 — 이 이름은 프로퍼티 전용입니다.
  HTML 에서 쓸 것: ${n}
  JS 에서는 el.${Hn(t)} 에 대입합니다.`))}}const Hn=i=>i.replace(/-([a-z])/g,(e,t)=>t.toUpperCase()),Ln=R`
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

  /*
    **flex: 1 이 아니라 flex: 1 1 auto 다.** 축약형 flex: 1 은 flex-basis: 0% 이고,
    그러면 본문의 flex base size 가 0 이다. 아래 min-height: 0 이 flex 항목의 자동
    최소 크기(auto)마저 꺼 두므로, 내용이 높이를 주장할 통로가 하나도 남지 않는다.

    <dialog> 는 UA 스타일시트의 height: fit-content 를 그대로 쓰는 고유 크기
    컨테이너다. 그 높이를 구할 때 Blink 는 명세 §9.9.1(max-content flex fraction)을
    구현해 항목의 내용 기여분을 더하지만, **WebKit 은 flex base size 만 더한다.**
    그래서 Safari 에서만 본문의 content box 가 0 으로 붕괴하고, 한 줄짜리 문장에도
    스크롤 막대가 생겼다. 같은 마크업을 두 엔진에서 재서 확인했다 — 본문 높이가
    Blink 19px / WebKit 0px 였다.

    auto 는 base size 를 내용 높이로 만들어 어느 엔진에서도 같은 값을 준다.
    flex-shrink: 1 과 min-height: 0 은 그대로 두는 것이 중요하다 — 대화상자가
    max-height 에 걸리면 그 둘이 본문을 내용보다 작게 줄여 주고, 그때 비로소
    overflow-y 가 일한다. **그 축소가 이 요소가 스크롤되는 유일하게 의도된 경로다.**

    주석에 백틱을 쓰지 않는 것도 이 파일에서는 규칙이다. css 태그드 템플릿 안이라
    백틱 하나가 리터럴을 끊는다.
  */
  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: var(--ns-space-6);
    /*
      ns-sidebar.styles.ts 의 nav 와 같은 가는 스크롤바. 감춘 적이 없어
      "감추지 않고 가늘게" 절이 여기는 겨냥하지 않지만, 결정이 이미 서
      있으므로 이 저장소의 세 스크롤 영역이 같은 모양이어야 한다. 표준
      경로와 WebKit 경로가 나뉘는 이유·값의 근거는 ns-sidebar.styles.ts
      의 주석과 tokens.css 의 --ns-scrollbar-width · --ns-scrollbar-thumb-inset
      정의 옆에 있다 — 여기서는 반복하지 않는다. shadow 안이라 controls.css
      가 닿지 않으므로 이 블록을 다시 적는다.
    */
    scrollbar-width: thin;
    scrollbar-color: var(--ns-color-line-strong) transparent;
  }

  .body:hover {
    scrollbar-color: var(--ns-color-fg-subtle) transparent;
  }

  .body::-webkit-scrollbar {
    width: var(--ns-scrollbar-width);
  }

  .body::-webkit-scrollbar-track {
    background: transparent;
  }

  .body::-webkit-scrollbar-thumb {
    background-color: var(--ns-color-line-strong);
    border-radius: var(--ns-radius-pill);
    border: var(--ns-scrollbar-thumb-inset) solid transparent;
    background-clip: padding-box;
  }

  .body::-webkit-scrollbar-thumb:hover {
    background-color: var(--ns-color-fg-subtle);
    background-clip: padding-box;
  }

  /*
    footer 는 내용이 있을 때만 보인다. slot 에 배정된 노드가 있는지는 CSS 로
    알 수 없어 slotchange 로 판정하고 hidden 속성을 건다.
    display: flex 가 UA 의 [hidden] 규칙을 이기므로 명시적으로 되돌린다.

    **이 규칙이 배치의 유일한 자리다.** 정렬과 gap 이 여기 있으므로 슬롯에 들어온
    것이 곧 flex 항목이어야 한다 — 버튼을 <div> 로 감싸면 항목이 래퍼 하나뿐이라
    가운데 정렬은 래퍼에 걸리고 gap 은 버튼 사이에 닿지 못한다. 감싸는 것 말고는
    방법이 없는 React shim 은 그 래퍼에 display: contents 를 줘서 비켜선다.
  */
  .footer {
    flex: none;
    display: flex;
    justify-content: center;
    gap: var(--ns-space-2);
    padding: 0 var(--ns-space-6) var(--ns-space-6);
  }

  .footer[hidden] {
    display: none;
  }
`,$e={menu:{viewBox:"0 0 20 20",content:Vt`
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},"chevron-down":{viewBox:"0 0 20 20",content:Vt`
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    `},close:{viewBox:"0 0 20 20",content:Vt`
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    `},google:{viewBox:"0 0 18 18",content:Vt`
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
    `}};function In(i){Object.assign($e,i)}const Bn=R`
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
`;var qn=Object.defineProperty,Kn=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&qn(e,t,s),s};const Ke=class Ke extends M{constructor(){super(...arguments);p(this,at);p(this,Ct);this.name="",l(this,Ct,"")}connectedCallback(){super.connectedCallback(),U()}render(){return A`<slot>${d(this,at,sn).call(this)}</slot>`}updated(){var n;const t=((n=this.renderRoot.querySelector("slot"))==null?void 0:n.assignedNodes())??[];if(!t.some(s=>s.nodeType===Node.ELEMENT_NODE)){if(t.length>0){d(this,at,es).call(this,`공백-${this.name}`,`[ns-icon] 공백만 든 자식이 슬롯을 채워 name="${this.name}" 폴백이 그려지지 않았다. <ns-icon name="${this.name}"></ns-icon> 처럼 안쪽을 붙여 쓴다.`);return}this.name!==""&&!$e[this.name]&&d(this,at,es).call(this,`없음-${this.name}`,`[ns-icon] 없는 아이콘: "${this.name}". 사용 가능: ${Object.keys($e).join(", ")}. registerIcons() 로 더하거나, 자식으로 직접 넣는다 — <ns-icon><MyIcon /></ns-icon> 는 name 없이 동작한다.`)}}};Ct=new WeakMap,at=new WeakSet,sn=function(){if(this.name==="")return y;const t=$e[this.name];return t?A`<svg viewBox=${t.viewBox} fill="none" aria-hidden="true">${t.content}</svg>`:y},es=function(t,n){c(this,Ct)!==t&&(l(this,Ct,t),console.warn(n))},Ke.styles=Bn;let Jt=Ke;Kn([v({type:String})],Jt.prototype,"name"),O("ns-icon",Jt);var Fn=Object.defineProperty,wt=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Fn(e,t,s),s};const Fe=class Fe extends M{constructor(){super(...arguments);p(this,S);p(this,j);p(this,lt);p(this,W);p(this,Qt);p(this,te);p(this,ee);p(this,se);p(this,ne);this.heading="",this.defaultOpen=!1,this.noBackdropClose=!1,this.hasFooter=!1,l(this,j,!1),l(this,lt,!1),l(this,W,!1),l(this,Qt,t=>{const n=t.target;this.hasFooter=n.assignedNodes({flatten:!0}).length>0}),l(this,te,()=>{if(c(this,W)){l(this,W,!1);return}d(this,S,Se).call(this,"escape")}),l(this,ee,()=>{d(this,S,Se).call(this,"close-button")}),l(this,se,t=>{l(this,lt,d(this,S,os).call(this,t))}),l(this,ne,t=>{const n=c(this,lt);l(this,lt,!1),!this.noBackdropClose&&t.detail!==0&&(!n||!d(this,S,os).call(this,t)||d(this,S,Se).call(this,"backdrop"))})}connectedCallback(){super.connectedCallback(),U(),et(this,{open:"default-open"});const t=this.dialogEl;t!=null&&t.open&&(l(this,W,!0),t.close()),this.requestUpdate()}firstUpdated(){this.defaultOpen&&l(this,j,!0)}show(){d(this,S,is).call(this,"show")||(l(this,j,!0),this.requestUpdate())}close(){d(this,S,is).call(this,"close")||(l(this,j,!1),this.requestUpdate())}updated(){const t=this.dialogEl;t&&(c(this,S,ns)&&!t.open?this.isConnected&&t.showModal():!c(this,S,ns)&&t.open&&(l(this,W,!0),t.close()))}render(){return A`
      <dialog
        aria-labelledby="dialog-heading"
        @close=${c(this,te)}
        @mousedown=${c(this,se)}
        @click=${c(this,ne)}
      >
        <div class="header">
          <h2 id="dialog-heading">${this.heading}</h2>
          <button class="close" type="button" aria-label="닫기" @click=${c(this,ee)}>
            <ns-icon name="close"></ns-icon>
          </button>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${c(this,Qt)}></slot>
        </div>
      </dialog>
    `}};j=new WeakMap,lt=new WeakMap,W=new WeakMap,S=new WeakSet,ss=function(){return this.open!==void 0},ns=function(){return this.open??c(this,j)},is=function(t){return c(this,S,ss)?(console.warn(`[ns-dialog] open 프로퍼티가 설정된 제어 모드에서는 ${t}() 가 동작하지 않습니다. open 을 바꾸세요.`),!0):!1},Qt=new WeakMap,te=new WeakMap,ee=new WeakMap,se=new WeakMap,ne=new WeakMap,os=function(t){const n=this.dialogEl;if(!n)return!1;const s=n.getBoundingClientRect();return t.clientX<s.left||t.clientX>s.right||t.clientY<s.top||t.clientY>s.bottom},Se=function(t){c(this,S,ss)||l(this,j,!1);const n={reason:t};this.dispatchEvent(new CustomEvent("ns-dialog-close",{detail:n,bubbles:!0,composed:!0})),this.requestUpdate()},Fe.styles=Ln;let T=Fe;wt([v({type:String})],T.prototype,"heading"),wt([v({attribute:!1})],T.prototype,"open"),wt([v({type:Boolean,attribute:"default-open"})],T.prototype,"defaultOpen"),wt([v({type:Boolean,attribute:"no-backdrop-close"})],T.prototype,"noBackdropClose"),wt([jn("dialog")],T.prototype,"dialogEl"),wt([ze()],T.prototype,"hasFooter"),O("ns-dialog",T);const Wn=R`
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
`;var Vn=Object.defineProperty,Is=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&Vn(e,t,s),s};const We=class We extends M{constructor(){super(...arguments);p(this,ie);this.projectName="",this.sidebarOpen=!1,l(this,ie,()=>{const t={open:!this.sidebarOpen};this.dispatchEvent(new CustomEvent("ns-toggle",{detail:t,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),U()}render(){return A`
      <header>
        <button
          class="toggle"
          type="button"
          aria-expanded=${this.sidebarOpen?"true":"false"}
          aria-label=${this.sidebarOpen?"사이드바 닫기":"사이드바 열기"}
          @click=${c(this,ie)}
        >
          <ns-icon name="menu"></ns-icon>
        </button>

        <span class="title">${this.projectName}</span>

        <div class="actions"><slot name="actions"></slot></div>
      </header>
    `}};ie=new WeakMap,We.styles=Wn;let _t=We;Is([v({type:String,attribute:"project-name"})],_t.prototype,"projectName"),Is([v({type:Boolean,reflect:!0,attribute:"sidebar-open"})],_t.prototype,"sidebarOpen"),O("ns-header",_t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zn={CHILD:2},Jn=i=>(...e)=>({_$litDirective$:i,values:e});let Xn=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{I:Yn}=Un,Bs=i=>i,qs=()=>document.createComment(""),Xt=(i,e,t)=>{var o;const n=i._$AA.parentNode,s=e===void 0?i._$AB:e._$AA;if(t===void 0){const r=n.insertBefore(qs(),s),a=n.insertBefore(qs(),s);t=new Yn(r,a,i,i.options)}else{const r=t._$AB.nextSibling,a=t._$AM,h=a!==i;if(h){let b;(o=t._$AQ)==null||o.call(t,i),t._$AM=i,t._$AP!==void 0&&(b=i._$AU)!==a._$AU&&t._$AP(b)}if(r!==s||h){let b=t._$AA;for(;b!==r;){const x=Bs(b).nextSibling;Bs(n).insertBefore(b,s),b=x}}}return t},st=(i,e,t=i)=>(i._$AI(e,t),i),Gn={},Qn=(i,e=Gn)=>i._$AH=e,ti=i=>i._$AH,Le=i=>{i._$AR(),i._$AA.remove()};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ks=(i,e,t)=>{const n=new Map;for(let s=e;s<=t;s++)n.set(i[s],s);return n},we=Jn(class extends Xn{constructor(i){if(super(i),i.type!==Zn.CHILD)throw Error("repeat() can only be used in text expressions")}dt(i,e,t){let n;t===void 0?t=e:e!==void 0&&(n=e);const s=[],o=[];let r=0;for(const a of i)s[r]=n?n(a,r):r,o[r]=t(a,r),r++;return{values:o,keys:s}}render(i,e,t){return this.dt(i,e,t).values}update(i,[e,t,n]){const s=ti(i),{values:o,keys:r}=this.dt(e,t,n);if(!Array.isArray(s))return this.ut=r,o;const a=this.ut??(this.ut=[]),h=[];let b,x,u=0,$=s.length-1,w=0,E=o.length-1;for(;u<=$&&w<=E;)if(s[u]===null)u++;else if(s[$]===null)$--;else if(a[u]===r[w])h[w]=st(s[u],o[w]),u++,w++;else if(a[$]===r[E])h[E]=st(s[$],o[E]),$--,E--;else if(a[u]===r[E])h[E]=st(s[u],o[E]),Xt(i,h[E+1],s[u]),u++,E--;else if(a[$]===r[w])h[w]=st(s[$],o[w]),Xt(i,s[u],s[$]),$--,w++;else if(b===void 0&&(b=Ks(r,w,E),x=Ks(a,u,$)),b.has(a[u]))if(b.has(a[$])){const H=x.get(r[w]),Qe=H!==void 0?s[H]:null;if(Qe===null){const Qs=Xt(i,s[u]);st(Qs,o[w]),h[w]=Qs}else h[w]=st(Qe,o[w]),Xt(i,s[u],Qe),s[H]=null;w++}else Le(s[$]),$--;else Le(s[u]),u++;for(;w<=E;){const H=Xt(i,h[E+1]);st(H,o[w]),h[w++]=H}for(;u<=$;){const H=s[u++];H!==null&&Le(H)}return this.ut=r,Qn(i,h),G}});var ei=Object.defineProperty,K=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&ei(e,t,s),s};class N extends M{constructor(){super(...arguments);p(this,D);p(this,oe);this.options=[],this.defaultValue=[],this.searchPlaceholder="검색",this.emptyMessage="결과가 없습니다",this.inputId="",this.inputDescribedby="",this.query=""}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),et(this,{value:"defaultValue 프로퍼티 (배열은 속성으로 쓸 수 없습니다)",options:"options 프로퍼티 (배열은 속성으로 쓸 수 없습니다)","default-value":"defaultValue 프로퍼티"})}render(){const t=c(this,D,rs),n=t.flatMap(r=>this.options.filter(a=>a.value===r)),s=this.query.trim().toLowerCase(),o=s===""?this.options:this.options.filter(r=>[r.label,r.meta??""].some(a=>a.toLowerCase().includes(s)));return A`
      ${n.length===0?y:A`
            <div class="ns-multi-select__chips">
              ${we(n,r=>r.value,r=>A`
                  <span class="ns-chip">
                    ${r.label}
                    <button
                      class="ns-chip__remove"
                      type="button"
                      aria-label=${`${r.label} 제거`}
                      @click=${()=>d(this,D,as).call(this,r.value)}
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
        id=${this.inputId===""?y:this.inputId}
        aria-describedby=${this.inputDescribedby===""?y:this.inputDescribedby}
        .value=${this.query}
        placeholder=${this.searchPlaceholder}
        @input=${r=>{this.query=r.target.value}}
      />

      <div class="ns-multi-select__list">
        ${o.length===0?A`<p class="ns-multi-select__empty">${this.emptyMessage}</p>`:we(o,r=>r.value,r=>A`
                <label class="ns-checkbox">
                  <input
                    type="checkbox"
                    .checked=${t.includes(r.value)}
                    @change=${a=>d(this,D,as).call(this,r.value,a.target)}
                  />
                  <span>${r.label}</span>
                  ${r.meta===void 0?y:A`<span class="ns-checkbox__hint">${r.meta}</span>`}
                </label>
              `)}
      </div>
    `}}oe=new WeakMap,D=new WeakSet,nn=function(){return this.value!==void 0},rs=function(){return this.value??c(this,oe)??this.defaultValue},as=function(t,n){const s=c(this,D,rs),o=s.includes(t)?s.filter(a=>a!==t):[...s,t];c(this,D,nn)?n!==void 0&&(n.checked=s.includes(t)):(l(this,oe,o),this.requestUpdate());const r={values:o};this.dispatchEvent(new CustomEvent("ns-multi-select-change",{detail:r,bubbles:!0,composed:!0}))},K([v({attribute:!1})],N.prototype,"options"),K([v({attribute:!1})],N.prototype,"value"),K([v({attribute:!1})],N.prototype,"defaultValue"),K([v({type:String,attribute:"search-placeholder"})],N.prototype,"searchPlaceholder"),K([v({type:String,attribute:"empty-message"})],N.prototype,"emptyMessage"),K([v({type:String,attribute:"input-id"})],N.prototype,"inputId"),K([v({type:String,attribute:"input-describedby"})],N.prototype,"inputDescribedby"),K([ze()],N.prototype,"query"),O("ns-multi-select",N);const si=R`
  :host {
    display: block;
  }

  /*
    collapsible 이면 <button>, 아니면 <div> 다. 두 경우가 같은 클래스를 쓰므로
    글꼴·색·패딩이 한 곳에 있고, 아래 button 전용 규칙이 UA 기본값만 되돌린다.

    안쪽 .row 가 flex 를 진다. 0.4.0 까지는 display 자리를 레일 전용 신호
    프로퍼티가 쓰고 있어 여기에 flex 를 얹을 수 없었고, 그 신호가 없어진 지금은
    얹을 수 있게 됐다. 그러나 이 구조가 아래 button.heading 의 UA 되돌림과
    얽혀 있어 바꾸는 것이 이 변경의 목표가 아니다.
  */
  /*
    white-space: nowrap 이 없으면 사이드바가 접히는 200ms 동안 헤딩이 줄어드는
    폭을 따라 줄바꿈한다 — ns-nav-item 의 .label 은 이미 nowrap 이라
    말줄임표로 잘리는데, 이쪽만 여러 줄로 접히며 "찢어지는" 것처럼 보였다.
    사이드바보다 긴 헤딩은 평상시에도 마찬가지다: nowrap 없이는 행이 늘어나
    아래 항목을 밀어내린다. white-space 는 상속되므로 아래 .text 에도
    닿는다.

    overflow: hidden; text-overflow: ellipsis 도 함께 둔다 — 비collapsible
    마크업(<div class="heading">텍스트)은 텍스트가 .heading 의 직접 인라인
    자식이라 여기서 바로 잘려야 한다. collapsible 쪽(<button class="heading">
    <span class="row"><span class="text">…)은 실제로 넘치는 것이 .heading
    자신이 아니라 .row 안의 .text 이므로 이 두 선언은 거기서는 아무 일도
    하지 않는다 — button 의 자식은 .row 하나뿐이고 .row 자체는 flex 폭이
    button 을 넘지 않아 button 수준에서는 넘칠 것이 없다. 그래서 .text 에
    같은 클리핑을 따로 둔다. 결과가 ns-nav-item 의 .label 과 같아진다 —
    같은 세 선언이 텍스트를 직접 감싸는 요소에 있다는 점에서, 그 요소가
    div.heading 이냐 span.text 이냐만 마크업에 따라 다를 뿐이다.
  */
  .heading {
    display: block;
    padding: var(--ns-space-4) var(--ns-space-4) var(--ns-space-2);
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-semibold);
    letter-spacing: 0.05em;
    color: var(--ns-color-fg-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*
    <button> 의 UA 기본값을 되돌린다. 위 .heading 이 글꼴·색을 이미 정하지만
    button 은 그것을 상속하지 않고 UA 가 정한 값을 갖는다.
  */
  button.heading {
    /*
      <button> 의 UA 기본값은 이미 border-box 라(div 와 다르다) 이 줄은 오늘
      아무것도 바꾸지 않는다. 그래도 적어 두는 이유는 이 규칙이 명시적
      width 와 padding 을 함께 쓰기 때문이다 — 이 저장소의 다른 모든 그런
      요소가 그렇게 한다(ns-sidebar.styles.ts, ns-header.styles.ts,
      ns-dialog.styles.ts). UA 기본값에 기대는 것과 그것을 적어 두는 것은
      다르다.
    */
    box-sizing: border-box;
    width: 100%;
    border: 0;
    background: none;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: color var(--ns-transition-fast) var(--ns-transition-ease);
  }

  button.heading:hover {
    color: var(--ns-color-fg-body);
  }

  /*
    controls.css 의 :focus-visible 규칙은 전역이라 shadow 안에 닿지 않는다.

    outline-offset 이 음수인 이유: 헤딩 버튼은 사이드바 폭 전체를 채우는데
    ns-sidebar.styles.ts 의 <nav> 가 overflow-x: hidden 이다. 바깥으로 그리면
    링이 그 경계에서 잘린다.
  */
  button.heading:focus-visible {
    outline: 2px solid var(--ns-color-accent);
    outline-offset: -2px;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ns-space-2);
  }

  /*
    .row 안에서 실제로 넘치는 요소. flex 아이템의 min-width 기본값은 auto 라
    콘텐츠 고유 폭 밑으로 줄지 않는다 — flex: 1 만으로는 이 span 이 줄어들지
    않고 .row 를 밀어 넘친다. min-width: 0 으로 그 하한을 없애야 아래
    overflow: hidden; text-overflow: ellipsis 가 실제로 자를 폭을 갖는다.
    white-space: nowrap 은 위 .heading 에서 상속받으므로 여기서 다시 쓰지
    않는다. ns-nav-item 의 .label 과 같은 세 선언(overflow·text-overflow·
    white-space) + flex 아이템이라 필요한 flex·min-width 가 더해진 모양이다.
  */
  .text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /*
    caret 은 헤딩 글자(--ns-font-size-sm, .875rem)에 붙는 것이라 --ns-icon-size(1.25rem)가
    크다. 커스텀 프로퍼티는 상속되므로 이 인스턴스에만 세우면 ns-icon 의 shadow
    :host 까지 도달한다. 사용처가 하나이고 변할 이유가 없으므로 리터럴이다.
  */
  .caret {
    --ns-icon-size: 1rem;
    flex: none;
    transition: transform var(--ns-transition-fast) var(--ns-transition-ease);
  }

  .caret.closed {
    transform: rotate(-90deg);
  }

  .list {
    padding: var(--ns-space-2);
  }

  /*
    접힘. 0.4.0 에는 여기 사이드바가 내려주는 신호 프로퍼티의 var() 폴백이
    있었다 — 레일에 항목이 납작하게 나오던 시절, 접힌 그룹의 항목에 도달할 경로를
    남기려고 사이드바가 레일에서 접힘을 무시하게 만드는 신호였다. 0.5.0
    개발 중에는 레일을 최상위 그룹 타일만 갖는 모델로 다시 만들어 봤지만
    화면에서 무엇인지 읽히지 않아 물렀다 — 그 모델에서도 레일에 항목이 없기는
    마찬가지라 신호의 전제는 이미 없었다. 지금은 레일 자체가 없다. 닫히면
    사이드바가 통째로 사라지므로 접힌 그룹의 항목에 닿을 경로가 애초에 없고,
    그 배선을 되살릴 이유도 없다. 경위는 docs/gotchas.md 에 있다.
  */
  .list.collapsed {
    display: none;
  }

  /*
    하위 카테고리. 중첩 여부는 JS 가 판정해 이 클래스로 남긴다 — 이유는
    ns-nav-group.ts 의 #nested 주석에 있다.

    240px 패널에서 글자 x 좌표가 이렇게 떨어진다.

      상위 제목 16 · 상위 직속 항목 16 · 하위 제목 28 · 하위 항목 28

    상위 제목의 padding-left(16)가 .list 패딩(8) + 행 패딩(8)과 같아서 상위
    제목과 상위 항목이 정렬되는 것과 같은 산수다. 하위는 들여쓰기 12 + 행
    패딩 8 = 20 이고 .list 패딩 8 을 더해 28 이다.

    **.list 의 대칭 패딩을 하위에서 없애고 왼쪽 들여쓰기만 두는 이유**는 항목의
    오른쪽 끝을 상위 항목과 같은 자리(232px)에 남기기 위해서다. 대칭 패딩을
    유지하면 하위 항목의 hover 배경이 오른쪽에서 8px 짧아져 계단이 생긴다.

    3단 이상을 넣으면 들여쓰기는 계속 누적된다(40 → 52). 제목 자가만 2단과
    같아진다 — 판정이 "조상에 ns-nav-group 이 있나" 라는 참/거짓이기 때문이다.
    패널 폭이 정해져 있어 깊이별로 다르게 만들 실익이 없다.

    특정도: 기본 .heading 은 (0,1,0), 이 규칙은 (0,3,0) 이므로 이긴다.
    button.heading 의 UA 되돌림(0,1,1)은 font-weight·letter-spacing 을 선언하지
    않으므로 다투지 않는다.
  */
  [role="group"].nested > .heading {
    padding-top: var(--ns-space-2);
    padding-left: calc(var(--ns-space-3) + var(--ns-space-2));
    font-weight: var(--ns-weight-medium);
    letter-spacing: normal;
  }

  [role="group"].nested > .list {
    padding: 0 0 0 var(--ns-space-3);
  }

  /*
    하위 그룹 사이의 간격. 최상위 그룹 사이에는 이제 아무 규칙도 없으므로 이것이
    이 라이브러리가 갖는 유일한 그룹 간 간격이다.

    **없어진 규칙의 기록.** 0.4.0 에는 최상위용으로
    :host(:not(:first-child)) [role="group"] { padding-top: var(--ns-space-6) }
    (24px)이 있었고 0.5.0 개발 중에 지웠다. 그때 지운 이유는 레일 설계에 있었다 —
    사이드바가 패널에 선택된 그룹 하나만 보이려고 수동 슬롯 배정을 썼고,
    :first-child 가 화면에 없는(배정되지 않은) 형제까지 세는 바람에 패널 위 여백이
    마크업 순서에 따라 달라졌다.

    **레일이 없어지면서 그 이유도 없어졌다.** 지금 최상위 그룹은 ns-sidebar 의
    light DOM 에서 실제 형제이고 전부 렌더되므로, 그 규칙을 되살리면 옳게 동작한다.
    되살리지 않는 것은 **못 해서가 아니라 판단이다** — 헤딩 자신의 padding-top(16px)이
    이미 그룹을 가르고, 최상위가 다섯 이상인 네비게이션(이 저장소의 index.html 이
    그렇다)에서는 24px 이 목록을 그만큼 길게 만든다. 24px 이 필요한 소비자는 문서
    CSS 한 줄로 되돌린다 — 호스트가 문서 트리에 있어 그 규칙이 shadow 를 이긴다.
    문구는 README.md 의 0.5.0 이주 절에 있고, 좁아진 최상위 그룹 간격이 소비자
    화면에서 실제로 괜찮은지는 자동 검사로 잡히지 않는 판단이라 사람이 눈으로
    본다.

    **여기서는 :first-child 가 옳게 동작한다.** 중첩 그룹은 부모의 light DOM 에서
    실제 형제이고 전부 렌더되므로 셈이 화면과 일치한다.
  */
  :host(:not(:first-child)) [role="group"].nested {
    padding-top: var(--ns-space-2);
  }
`;var ni=Object.defineProperty,_e=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&ni(e,t,s),s};const Ve=class Ve extends M{constructor(){super(...arguments);p(this,ht);p(this,ct);p(this,St);p(this,dt);p(this,re);this.heading="",this.collapsible=!1,this.defaultCollapsed=!1,l(this,ct,!1),l(this,St,!1),l(this,dt,!1),l(this,re,()=>{const t=!c(this,ht,ls);l(this,St,!0),c(this,ht,on)||(l(this,ct,!t),this.requestUpdate());const n={open:t};this.dispatchEvent(new CustomEvent("ns-group-toggle",{detail:n,bubbles:!0,composed:!0}))})}connectedCallback(){var n;super.connectedCallback(),U(),et(this,{open:"default-collapsed"});const t=((n=this.parentElement)==null?void 0:n.closest("ns-nav-group"))!=null;t!==c(this,dt)&&(l(this,dt,t),this.requestUpdate())}willUpdate(t){t.has("defaultCollapsed")&&!c(this,St)&&l(this,ct,this.defaultCollapsed)}render(){const t=c(this,ht,ls);return A`
      <div role="group" aria-label=${this.heading} class=${c(this,dt)?"nested":""}>
        ${this.collapsible?A`
              <button
                class="heading"
                type="button"
                aria-expanded=${t?"true":"false"}
                aria-controls="list"
                @click=${c(this,re)}
              >
                <span class="row">
                  <span class="text">${this.heading}</span>
                  <ns-icon
                    class=${t?"caret":"caret closed"}
                    name="chevron-down"
                  ></ns-icon>
                </span>
              </button>
            `:A`<div class="heading">${this.heading}</div>`}
        <div id="list" class=${this.collapsible&&!t?"list collapsed":"list"}>
          <slot></slot>
        </div>
      </div>
    `}};ct=new WeakMap,St=new WeakMap,dt=new WeakMap,ht=new WeakSet,on=function(){return this.open!==void 0},ls=function(){return this.open??!c(this,ct)},re=new WeakMap,Ve.styles=si;let F=Ve;_e([v({type:String})],F.prototype,"heading"),_e([v({type:Boolean})],F.prototype,"collapsible"),_e([v({attribute:!1})],F.prototype,"open"),_e([v({type:Boolean,attribute:"default-collapsed"})],F.prototype,"defaultCollapsed"),O("ns-nav-group",F);const ii=R`
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

  /*
    배경만 바뀌면 "누를 수 있다" 가 정적인 대비로만 드러난다. 글자색이 함께
    올라가면 반응으로도 드러난다 — collapsible 인 그룹 제목이 이미 같은 모양의
    hover 를 갖고 있어 둘이 같은 규약을 쓴다.
  */
  .row:hover {
    background: var(--ns-color-surface-sunken);
    color: var(--ns-color-fg);
  }

  :host([active]) .row {
    background: var(--ns-color-surface-hover);
    color: var(--ns-color-fg);
  }

  /*
    소비자가 넣은 요소의 상한. 크기 자체는 여기서 주지 않는다 — 보통 들어오는
    <ns-icon> 은 자기 shadow 의 :host 에서 --ns-icon-size 로 크기를 갖고 그것이
    이 상한보다 작다. 크기가 없는 것을 넣으면 이 규칙은 그것을 키워 주지 않는다.

    flex: none 이 필요한 이유는 이것이 이제 .leading 래퍼 없이 .row 의 직계
    flex 항목이기 때문이다 — 라벨이 길면 축소 대상이 된다.
  */
  ::slotted([slot="leading"]) {
    flex: none;
    max-width: var(--ns-control-height-sm);
    max-height: var(--ns-control-height-sm);
  }

  /*
    flex: 1 과 min-width: 0 이 함께 있어야 한다. flex 자식은 기본이
    min-width: auto 라 내용보다 작아지지 않고, 그러면 text-overflow 가
    동작하지 않는다.
  */
  .label {
    display: block;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--ns-font-size-sm);
    line-height: var(--ns-line-height-sm);
    font-weight: var(--ns-weight-medium);
  }

  /*
    leading 과 달리 max-width 를 주지 않는다. trailing 은 배지·카운트처럼
    내용에 따라 넓어지는 것이 정상이다 — "3" 과 "128" 은 너비가 달라야
    맞다. 높이만 행 높이에 맞춰 눌러 준다.

    flex: none 이 필요한 이유는 leading 과 같다 — 이제 .trailing 래퍼
    없이 .row 의 직계 flex 항목이라, 라벨이 길면 축소 대상이 된다.
  */
  ::slotted([slot="trailing"]) {
    flex: none;
    max-height: var(--ns-control-height-sm);
  }
`;var oi=Object.defineProperty,Ie=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&oi(e,t,s),s};const Ze=class Ze extends M{constructor(){super(...arguments);p(this,ae);this.href="",this.label="",this.active=!1,l(this,ae,t=>{if(t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;t.preventDefault();const n={href:this.href,label:this.label};this.dispatchEvent(new CustomEvent("ns-navigate",{detail:n,bubbles:!0,composed:!0}))})}connectedCallback(){super.connectedCallback(),U()}render(){return A`
      <a class="row" href=${this.href} title=${this.label} @click=${c(this,ae)}>
        <slot name="leading"></slot>
        <span class="label">${this.label}</span>
        <slot name="trailing"></slot>
      </a>
    `}};ae=new WeakMap,Ze.styles=ii;let nt=Ze;Ie([v({type:String})],nt.prototype,"href"),Ie([v({type:String})],nt.prototype,"label"),Ie([v({type:Boolean,reflect:!0})],nt.prototype,"active"),O("ns-nav-item",nt);const ri=R`
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
`;var ai=Object.defineProperty,Fs=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&ai(e,t,s),s};const Je=class Je extends M{constructor(){super(...arguments),this.heading="",this.description=""}connectedCallback(){super.connectedCallback(),U()}render(){return A`
      <h1>${this.heading}</h1>
      ${this.description?A`<p>${this.description}</p>`:y}
    `}};Je.styles=ri;let xt=Je;Fs([v({type:String})],xt.prototype,"heading"),Fs([v({type:String})],xt.prototype,"description"),O("ns-page-heading",xt);var li=Object.defineProperty,Yt=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&li(e,t,s),s};const Be=7;function xe(i,e){return Array.from({length:Math.max(e-i+1,0)},(t,n)=>i+n)}function ci(i,e,t){if(e<=t)return xe(1,e);const n=t-2,s=(t-5)/2;return i<=n?[...xe(1,n),"gap",e]:i>e-n?[1,"gap",...xe(e-n+1,e)]:[1,"gap",...xe(i-s,i+s),"gap",e]}class it extends M{constructor(){super(...arguments);p(this,k);p(this,V);p(this,Et);p(this,Pt);p(this,Mt);p(this,Ot);p(this,ut);this.total=0,this.perPage=20,this.defaultPage=1,this.pageWindow=Be,l(this,V,1),l(this,Et,!1),l(this,Pt,!1),l(this,Mt,!1),l(this,Ot,!1),l(this,ut,null)}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),et(this,{page:"default-page"})}willUpdate(){if(!this.hasUpdated){if(!Number.isInteger(this.defaultPage)||this.defaultPage<1){console.warn(`[ns-pagination] default-page=${this.defaultPage} 는 1 이상의 정수여야 합니다. 1 페이지에서 시작합니다.`);return}this.defaultPage!==1&&l(this,V,this.defaultPage)}}updated(){var o;const t=c(this,ut);if(t===null||(l(this,ut,null),(this.page??c(this,V))!==t.page))return;const n=this.ownerDocument.activeElement;if(n!==null&&n!==this.ownerDocument.body&&!this.contains(n))return;const s=typeof t.control=="number"?`button[data-ns-page="${t.control}"]`:`button[data-ns-nav="${t.control}"]`;(o=this.querySelector(s))==null||o.focus()}render(){const t=c(this,k,Ee);if(t<=1)return y;const n=d(this,k,ds).call(this);return A`
      <nav aria-label="페이지 이동">
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="prev"
          aria-disabled=${n===1?"true":y}
          @click=${()=>d(this,k,Pe).call(this,"prev",n-1)}
        >
          이전
        </button>
        <span class="ns-pagination-pages">
          ${we(ci(n,t,c(this,k,rn)),(s,o)=>s==="gap"?`gap-${o}`:s,s=>s==="gap"?A`<span class="ns-pagination-gap" aria-hidden="true">…</span>`:A`<button
                    class=${s===n?"ns-button ns-button--outline ns-button--sm":"ns-button ns-button--ghost ns-button--sm"}
                    type="button"
                    data-ns-page=${s}
                    aria-current=${s===n?"page":y}
                    @click=${()=>d(this,k,Pe).call(this,s,s)}
                  >
                    ${s}
                  </button>`)}
        </span>
        <button
          class="ns-button ns-button--ghost ns-button--sm"
          type="button"
          data-ns-nav="next"
          aria-disabled=${n===t?"true":y}
          @click=${()=>d(this,k,Pe).call(this,"next",n+1)}
        >
          다음
        </button>
      </nav>
    `}}V=new WeakMap,Et=new WeakMap,Pt=new WeakMap,Mt=new WeakMap,Ot=new WeakMap,ut=new WeakMap,k=new WeakSet,cs=function(){return this.page!==void 0},Ee=function(){return this.perPage>0?!Number.isFinite(this.total)||this.total<0?(c(this,Mt)||(l(this,Mt,!0),console.warn(`[ns-pagination] total=${this.total} 은 0 이상의 유한한 수여야 합니다. 페이징을 렌더하지 않습니다.`)),0):Math.ceil(this.total/this.perPage):(c(this,Pt)||(l(this,Pt,!0),console.warn(`[ns-pagination] per-page=${this.perPage} 는 1 이상이어야 합니다. 페이징을 렌더하지 않습니다.`)),0)},rn=function(){const t=this.pageWindow;return Number.isInteger(t)&&t>=5&&t%2===1?t:(c(this,Ot)||(l(this,Ot,!0),console.warn(`[ns-pagination] page-window=${t} 는 5 이상의 홀수여야 합니다. ${Be} 로 그립니다.`)),Be)},ds=function(){const t=this.page??c(this,V),n=c(this,k,Ee);if(Number.isInteger(t)&&t>=1&&t<=n)return t;const s=Number.isFinite(t)?Math.min(Math.max(Math.round(t),1),Math.max(n,1)):1;return c(this,Et)||(l(this,Et,!0),console.warn(c(this,k,cs)?`[ns-pagination] page=${t} 가 1..${n} 범위를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`:`[ns-pagination] 현재 페이지 ${t} 가 total=${this.total} · per-page=${this.perPage} 로 계산된 페이지 수(${n})를 벗어났습니다. 표시용으로 ${s} 로 보정합니다.`)),s},an=function(t){if(!Number.isInteger(t)||t<1||t>c(this,k,Ee)||t===d(this,k,ds).call(this))return!1;c(this,k,cs)||(l(this,V,t),this.requestUpdate());const n={page:t};return this.dispatchEvent(new CustomEvent("ns-page-change",{detail:n,bubbles:!0,composed:!0})),!0},Pe=function(t,n){d(this,k,an).call(this,n)&&l(this,ut,{control:t,page:n})},Yt([v({type:Number})],it.prototype,"total"),Yt([v({type:Number,attribute:"per-page"})],it.prototype,"perPage"),Yt([v({attribute:!1})],it.prototype,"page"),Yt([v({type:Number,attribute:"default-page"})],it.prototype,"defaultPage"),Yt([v({type:Number,attribute:"page-window"})],it.prototype,"pageWindow"),O("ns-pagination",it);const di=R`
  /*
    overflow-y: auto 가 동작하려면 조상 체인에 실제 높이가 이어져 있어야
    한다. 소비자가 이 엘리먼트에 높이를 주는 레이아웃에 넣어야 한다.

    배경·너비는 preflight 가 건드리지 않으므로 :host 에 그대로 둔다 — 소비자가
    ns-sidebar { … } 로 덮을 자리를 남긴다.
  */
  :host {
    display: block;
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    width: var(--ns-sidebar-width);
    /*
      양방향을 함께 자른다. 닫힘 규칙에만 두면 열릴 때 규칙이 즉시 매칭을 멈추는
      바람에 폭이 200ms 동안 늘어나는 내내 안의 <nav> 가 호스트 밖으로, 곧 <main>
      위로 그려진다. overflow 는 check-tokens.mjs 규칙 ④ 의 박스 프로퍼티
      (border·margin·padding)가 아니므로 :host 에 두어도 된다.
    */
    overflow: hidden;
    background: var(--ns-color-surface);
    transition: width 200ms var(--ns-transition-ease);
  }

  /*
    닫힘. 레일을 남기지 않고 통째로 사라진다.

    open 이 프로퍼티 전용이라 호스트에는 그 이름의 속성이 없다. 대신 컴포넌트가
    updated() 에서 data-ns-open 을 쓰고, upgrade 전 구간은 tokens.css 의 예약이
    default-open 과 data-ns-open 을 함께 봐서 덮는다. 세 구간이 이렇게 이어진다 —
    upgrade 전에는 문서 예약이, upgrade 와 hydration 사이에는 shim 이 렌더한
    default-open 을 Lit 의 컨버터가 읽어 세운 값이, hydration 이후에는 컴포넌트가
    쓰는 data-ns-open 이 폭을 잡는다.
  */
  :host(:not([data-ns-open])) {
    width: var(--ns-sidebar-width-collapsed);
  }

  /*
    닫히면 탭 순서에서도 빠진다. 폭 0 과 overflow: hidden 은 자를 뿐 숨기지
    않으므로, 그것만으로는 보이지 않는 링크에 Tab 이 내려앉는다.

    지연을 새 상태 쪽에 두는 것이 요점이다 — 닫힐 때는 200ms 뒤에 숨어 애니메이션이
    끝난 뒤에 사라지고, 열릴 때는 기본 규칙에 전이가 없어 즉시 보인다.
  */
  :host(:not([data-ns-open])) nav {
    visibility: hidden;
    transition: visibility 0s 200ms;
  }

  /*
    경계선과 스크롤을 호스트가 아니라 이 <nav> 가 갖는다.

    호스트는 문서 트리에 있으므로 소비자의 문서 규칙이 :host 를 이긴다.
    특정도가 아니라 캐스케이드 순서로 정해지는 것이라 :host 쪽이 아무리
    구체적이어도 진다. Tailwind preflight 의 "*, ::before, ::after,
    ::backdrop { border: 0 solid }" 가 그 규칙이다.

    overflow 를 함께 내리는 이유는 스크롤바와 경계선의 순서다. 경계선만 내리면
    스크롤바가 호스트 것이라 경계선 오른쪽에 생긴다. 같은 요소가 둘을 가져야
    스크롤바가 경계선 안쪽에 남는다.

    min-width: var(--ns-sidebar-width) 를 nav 에 둔다. 이게 없으면 :host 의
    width 전이 200ms 동안 nav 자체가 실제로 좁아져 안의 내용이 그 폭을 따라
    리플로우한다. 예전에는 여기에 "안의 .label 이 white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis 라 글자가 말줄임표로 점진적으로
    줄어들 뿐 레이아웃이 깨지지 않는다" 고 적혀 있었다 — 그 주장은 틀렸다.
    사용자가 실제로 접히는 것을 보고 신고했다: 글자 사이 간격이 줄고 아이콘·
    라벨이 서로 밀리며 찌그러지다 사라지는 것으로 보이고, ns-nav-group 의
    heading 은 white-space: nowrap 조차 없어 여러 줄로 줄바꿈까지 됐다(그건
    ns-nav-group.styles.ts 에서 따로 고친다). min-width 로 nav 를
    --ns-sidebar-width 에 고정하면 전이 내내 내용이 그대로 있고, :host 의
    overflow: hidden 이 넘치는 부분만 자른다 — 전이가 "잘려 사라짐"으로
    보이지 "찌그러져 사라짐"으로 보이지 않는다.

    전에는 이걸 뺐다 — :host { width: … } 를 토큰보다 좁게 override 하는
    소비자에게서 min-width 가 여전히 --ns-sidebar-width 를 붙들어 nav 가
    호스트 밖으로 삐져나왔기 때문이다. 그 사고는 지금 안 난다 — :host 가
    그새 양방향 overflow: hidden 을 얻었다(위 참조, 여는 동안 페인트가
    <main> 위로 새는 것을 막으려고 나중에 추가됐다). nav 가 호스트보다
    넓어도 이제 호스트 경계에서 잘리기만 하지 삐져나오지 않는다.

    남는 대가는 하나, 없애지는 못했다. width override 가 토큰보다 좁으면
    내용은 여전히 --ns-sidebar-width 기준으로 배치된 채 그 좁은 폭에서
    잘린다 — 레이아웃이 깨지진 않지만 내용이 다 보이지도 않는다. 그래서
    폭을 조절하는 공식 통로는 --ns-sidebar-width 토큰이고, ns-sidebar
    { width } 만 override 하는 것은 토큰보다 좁지 않을 때만 안전하다. 같은
    문구가 README.md 의 0.5.0 이주 절과 index.html 의 ns-sidebar 절에도
    있다.
  */
  nav {
    box-sizing: border-box;
    height: 100%;
    min-width: var(--ns-sidebar-width);
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 1px solid var(--ns-color-line);
    /*
      감추지 않고 가늘게 만든다. 표준 프로퍼티 하나로는 하한을 못 덮어 둘을
      함께 쓴다 — scrollbar-width·scrollbar-color 는 Chrome 121·Firefox 64
      부터라 이 저장소의 하한(Chrome 123·Firefox 121)을 덮지만, Safari 는
      18.2 부터로 하한(17.5)보다 위다. 아래의 ::-webkit-scrollbar 계열은
      비표준이지만 Safari 전 버전과 Chrome 에서 동작해 그 구멍을 막는다.

      두 경로가 같은 요소에서 다투지 않는다 — Chrome 이 scrollbar-width·
      scrollbar-color 를 auto 아닌 값으로 지원하면 레거시 ::-webkit-scrollbar
      계열을 통째로 무시하도록 CSS 워킹 그룹이 정리했다(2024년 결정, Chrome
      121 부터 반영). 그래서 이 저장소 하한에서는 Chrome·Firefox 가 표준
      경로를, 18.2 미만 Safari 만 WebKit 경로를 탄다 — 겹쳐 그려지지 않는다.

      두 경로가 픽셀 단위로 같을 수는 없다 — 표준 scrollbar-width 는 auto·
      thin·none 세 키워드만 받아 두께를 고를 수 없고, WebKit 쪽만 트랙 폭과
      여백을 직접 그릴 수 있다. 아래에서 각각 최대한 가깝게 맞췄을 뿐이다.

      :host-context() 를 금지한 이유와는 다르다 — 그것은 없으면 기능이
      조용히 죽는다. 여기서 WebKit 규칙이 빠지면(18.2 미만 Safari 가 아닌
      다른 상상 속 엔진이라면) 플랫폼 기본 스크롤바로 떨어질 뿐 스크롤
      자체는 죽지 않는다. 그래서 이 벤더 접두사는 전례가 되지 않는다 —
      판단 기준은 "없으면 죽는가, 못생겨지는가" 이지 벤더 접두사 자체의
      허용이 아니다.

      감추지 않고 칠하기로 한 이유는 따로 있다 — 막대를 완전히 지우면
      "목록이 더 이어진다" 는 것을 알려주는 유일한 정적 신호가 함께
      사라진다. 가늘게 두면 그 신호는 남기고 존재감만 줄어든다.
    */
    scrollbar-width: thin;
    scrollbar-color: var(--ns-color-line-strong) transparent;
  }

  /*
    목록 안에 있을 때만 눈에 띄게 한다 — 평소엔 옅다가 스크롤하려는 그
    순간에 진해지는 편이 항상 진한 것보다 덜 거슬린다. scrollbar-color 는
    transition 대상이 아니라(애니메이션 불가 프로퍼티) 즉시 전환된다.
  */
  nav:hover {
    scrollbar-color: var(--ns-color-fg-subtle) transparent;
  }

  /*
    WebKit 쪽 두께는 트랙(--ns-scrollbar-width)과 인셋(--ns-scrollbar-thumb-inset)을
    함께 정해 만든다. border 를 transparent 로 주고 background-clip:
    padding-box 를 쓰면 배경색이 border 안쪽(패딩 상자)에서만 칠해져,
    실제로 보이는 막대는 트랙보다 좁고 양옆에 여백이 남는다 — border
    두께만큼 막대가 트랙 가운데로 졸아든다. border 를 안 쓰고 막대 폭만
    줄이면 트랙 배경이 그대로 남아 막대 옆에 색 있는 여백이 아니라 색
    없는 여백이 필요한데, ::-webkit-scrollbar-track 자체가 transparent
    라 그 여백을 만드는 유일한 수단이 이 인셋이다.

    두 값을 토큰으로 뽑은 이유는 tokens.css 의 정의 옆 주석에 있다 — 이
    블록이 ns-dialog · .ns-multi-select__list 에도 그대로 반복되면서
    "한 곳에만 있는 구조적 상수" 에서 "두 곳 이상에 나타나는 값" 으로
    넘어갔다.
  */
  nav::-webkit-scrollbar {
    width: var(--ns-scrollbar-width);
  }

  nav::-webkit-scrollbar-track {
    background: transparent;
  }

  nav::-webkit-scrollbar-thumb {
    background-color: var(--ns-color-line-strong);
    border-radius: var(--ns-radius-pill);
    border: var(--ns-scrollbar-thumb-inset) solid transparent;
    background-clip: padding-box;
  }

  nav::-webkit-scrollbar-thumb:hover {
    background-color: var(--ns-color-fg-subtle);
    background-clip: padding-box;
  }
`;var hi=Object.defineProperty,Ws=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&hi(e,t,s),s};const Xe=class Xe extends M{constructor(){super(...arguments);p(this,ke);p(this,Ut);this.defaultOpen=!1,l(this,Ut,!1)}connectedCallback(){super.connectedCallback(),U(),et(this,{open:"default-open"})}willUpdate(t){t.has("defaultOpen")&&l(this,Ut,this.defaultOpen===!0)}updated(){this.toggleAttribute("data-ns-open",c(this,ke,ln))}render(){return A`<nav><slot></slot></nav>`}};Ut=new WeakMap,ke=new WeakSet,ln=function(){return this.open??c(this,Ut)},Xe.styles=di;let At=Xe;Ws([v({attribute:!1})],At.prototype,"open"),Ws([v({type:Boolean,attribute:"default-open"})],At.prototype,"defaultOpen"),O("ns-sidebar",At);const ui=R`
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
`;var pi=Object.defineProperty,qe=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&pi(e,t,s),s};const fi=new Set(["badge","control","panel","card","pill"]),Ye=class Ye extends M{constructor(){super(...arguments);p(this,Ce);this.width="100%",this.height="1rem",this.radius="control"}connectedCallback(){super.connectedCallback(),U()}render(){return A`
      <div
        class="bar"
        aria-hidden="true"
        style="width:${this.width};height:${this.height};border-radius:${d(this,Ce,cn).call(this)}"
      ></div>
    `}};Ce=new WeakSet,cn=function(){return fi.has(this.radius)?`var(--ns-radius-${this.radius})`:this.radius},Ye.styles=ui;let ot=Ye;qe([v({type:String})],ot.prototype,"width"),qe([v({type:String})],ot.prototype,"height"),qe([v({type:String})],ot.prototype,"radius"),O("ns-skeleton",ot);var gi=Object.defineProperty,Gt=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&gi(e,t,s),s};function bi(i){return i==="none"?"ascending":i==="ascending"?"descending":"none"}class rt extends B{constructor(){super(...arguments);p(this,f);p(this,pt);p(this,ft);p(this,gt);p(this,Tt);p(this,Nt);p(this,Dt);this.defaultSortKey="",this.defaultSortDirection="none",l(this,pt,""),l(this,ft,"none"),l(this,Tt,!1),l(this,Dt,t=>{const n=t.target,s=n==null?void 0:n.closest('input[type="checkbox"][data-ns-select-all], input[type="checkbox"][data-ns-row-id]');if(s&&d(this,f,Lt).call(this,s)){d(this,f,fn).call(this,s);return}const o=n==null?void 0:n.closest("th[data-ns-sort-key]");if(!o||!d(this,f,Lt).call(this,o))return;const r=o.dataset.nsSortKey??"",a=r===c(this,f,hs)?bi(c(this,f,us)):"ascending",h=a==="none"?"":r;c(this,f,dn)||(l(this,pt,h),l(this,ft,a),this.requestUpdate());const b={key:h,direction:a};this.dispatchEvent(new CustomEvent("ns-sort",{detail:b,bubbles:!0,composed:!0}))})}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),et(this,{"sort-key":"default-sort-key","sort-direction":"default-sort-direction",selected:"각 행 checkbox 의 checked 속성"}),this.addEventListener("click",c(this,Dt)),l(this,Nt,new MutationObserver(()=>{d(this,f,ps).call(this),d(this,f,pe).call(this),d(this,f,pn).call(this)})),c(this,Nt).observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var t;this.removeEventListener("click",c(this,Dt)),(t=c(this,Nt))==null||t.disconnect(),super.disconnectedCallback()}firstUpdated(){this.defaultSortKey!==""&&l(this,pt,this.defaultSortKey),this.defaultSortDirection!=="none"&&l(this,ft,this.defaultSortDirection),this.selected===void 0&&l(this,gt,d(this,f,fs).call(this))}updated(){d(this,f,hn).call(this),d(this,f,ps).call(this),d(this,f,pe).call(this)}}pt=new WeakMap,ft=new WeakMap,gt=new WeakMap,Tt=new WeakMap,Nt=new WeakMap,f=new WeakSet,dn=function(){return this.sortKey!==void 0},hs=function(){return this.sortKey??c(this,pt)},us=function(){return this.sortDirection??c(this,ft)},hn=function(){c(this,Tt)||this.sortDirection===void 0||this.sortKey!==void 0||(l(this,Tt,!0),console.warn(`[ns-table] sortDirection="${this.sortDirection}" 만 설정하고 sortKey 는 설정하지 않았습니다. 둘은 짝이라 이 상태에서는 정렬 방향이 바뀌지 않습니다. 제어하려면 둘 다 설정하고, 비제어 초기값이 목적이면 default-sort-direction 을 쓰세요.`))},Lt=function(t){return t.closest("ns-table")===this},ps=function(){const t=c(this,f,hs),n=c(this,f,us);for(const s of this.querySelectorAll("th[data-ns-sort-key]"))d(this,f,Lt).call(this,s)&&(s.dataset.nsSortKey===t&&n!=="none"?s.setAttribute("aria-sort",n):s.removeAttribute("aria-sort"))},Dt=new WeakMap,Me=function(){return[...this.querySelectorAll("input[data-ns-row-id]")].filter(t=>d(this,f,Lt).call(this,t))},vt=function(t){return t.dataset.nsRowId??""},pe=function(){const t=[...this.querySelectorAll("input[data-ns-select-all]")].filter(h=>d(this,f,Lt).call(this,h));if(t.length===0)return;const n=d(this,f,Me).call(this),s=this.selected,o=s===void 0?n.filter(h=>h.checked).length:n.filter(h=>s.includes(d(this,f,vt).call(this,h))).length,r=n.length>0&&o===n.length,a=o>0&&o<n.length;for(const h of t)h.checked=r,h.indeterminate=a},fs=function(){return d(this,f,Me).call(this).filter(t=>t.checked).map(t=>d(this,f,vt).call(this,t))},un=function(t,n){if(t.length!==n.length)return!1;const s=new Set(n);return t.every(o=>s.has(o))},pn=function(){if(this.selected!==void 0)return;const t=d(this,f,fs).call(this),n=c(this,gt);if(!(n!==void 0&&d(this,f,un).call(this,n,t))){if(n===void 0||this.ownerDocument.readyState==="loading"){l(this,gt,t);return}d(this,f,fe).call(this,t)}},fe=function(t){l(this,gt,t);const n={ids:t};this.dispatchEvent(new CustomEvent("ns-select-change",{detail:n,bubbles:!0,composed:!0}))},fn=function(t){const n=d(this,f,Me).call(this);if(t.hasAttribute("data-ns-select-all")){if(this.selected===void 0)for(const a of n)a.checked=t.checked;d(this,f,fe).call(this,t.checked?n.map(a=>d(this,f,vt).call(this,a)):[]),this.selected===void 0&&d(this,f,pe).call(this);return}if(!t.hasAttribute("data-ns-row-id"))return;let s;if(this.selected===void 0){s=n.filter(a=>a.checked).map(a=>d(this,f,vt).call(this,a)),d(this,f,fe).call(this,s),d(this,f,pe).call(this);return}const o=new Set(this.selected),r=d(this,f,vt).call(this,t);t.checked?o.add(r):o.delete(r),s=n.map(a=>d(this,f,vt).call(this,a)).filter(a=>o.has(a)),d(this,f,fe).call(this,s)},Gt([v({attribute:!1})],rt.prototype,"sortKey"),Gt([v({attribute:!1})],rt.prototype,"sortDirection"),Gt([v({type:String,attribute:"default-sort-key"})],rt.prototype,"defaultSortKey"),Gt([v({type:String,attribute:"default-sort-direction"})],rt.prototype,"defaultSortDirection"),Gt([v({attribute:!1})],rt.prototype,"selected"),O("ns-table",rt);var vi=Object.defineProperty,Vs=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&vi(e,t,s),s};function Zs(i){return`${i}-tab`}class Ae extends B{constructor(){super(...arguments);p(this,m);p(this,bt);p(this,Rt);p(this,jt);p(this,zt);p(this,Ht);this.defaultActive="",l(this,bt,""),l(this,jt,!1),l(this,zt,t=>{const n=d(this,m,ys).call(this,t.target);n!==null&&d(this,m,vs).call(this,d(this,m,mt).call(this,n),!1)}),l(this,Ht,t=>{const n=d(this,m,ys).call(this,t.target);if(n===null)return;const s=c(this,m,ge),o=s.indexOf(n);if(o===-1)return;const r=a=>{t.preventDefault(),d(this,m,vs).call(this,d(this,m,mt).call(this,s[(a+s.length)%s.length]),!0)};t.key==="ArrowRight"?r(o+1):t.key==="ArrowLeft"?r(o-1):t.key==="Home"?r(0):t.key==="End"&&r(s.length-1)})}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),U(),et(this,{active:"default-active"}),this.hasAttribute("role")||this.setAttribute("role","tablist"),this.addEventListener("click",c(this,zt)),this.addEventListener("keydown",c(this,Ht)),l(this,Rt,new MutationObserver(()=>d(this,m,Oe).call(this))),c(this,Rt).observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var t;this.removeEventListener("click",c(this,zt)),this.removeEventListener("keydown",c(this,Ht)),(t=c(this,Rt))==null||t.disconnect(),super.disconnectedCallback()}firstUpdated(){this.defaultActive!==""&&l(this,bt,this.defaultActive)}updated(){d(this,m,Oe).call(this)}}bt=new WeakMap,Rt=new WeakMap,jt=new WeakMap,m=new WeakSet,gs=function(){return this.active!==void 0},ge=function(){return[...this.querySelectorAll("[data-ns-tab]")].filter(t=>t.closest("ns-tabs")===this)},mt=function(t){return t.dataset.nsTab??""},bs=function(){const t=c(this,m,ge);if(t.length===0)return"";const n=this.active??c(this,bt);if(t.some(o=>d(this,m,mt).call(this,o)===n))return n;const s=d(this,m,mt).call(this,t[0]);return n!==""&&!c(this,jt)&&(l(this,jt,!0),console.warn(c(this,m,gs)?`[ns-tabs] active="${n}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${s}" 을 표시하지만 그 탭을 눌러도 ns-tab-change 가 나가지 않습니다. 대소문자까지 맞는지 확인하세요.`:`[ns-tabs] 활성 탭 "${n}" 와 일치하는 data-ns-tab 이 없습니다. 첫 번째 탭 "${s}" 을 표시합니다. default-active 값이 data-ns-tab 과 맞는지 확인하세요.`)),s},Oe=function(){const t=c(this,m,bs);for(const n of c(this,m,ge)){const s=d(this,m,mt).call(this,n),o=n.dataset.nsPanel??"";n.setAttribute("role","tab"),!n.hasAttribute("id")&&o!==""&&n.setAttribute("id",Zs(o)),o!==""&&n.setAttribute("aria-controls",o),n.setAttribute("aria-selected",s===t?"true":"false"),n.setAttribute("tabindex",s===t?"0":"-1")}},vs=function(t,n){if(t==="")return;if(t===c(this,m,bs)){n&&d(this,m,ms).call(this,t);return}c(this,m,gs)||(l(this,bt,t),this.requestUpdate());const s={id:t};this.dispatchEvent(new CustomEvent("ns-tab-change",{detail:s,bubbles:!0,composed:!0})),d(this,m,Oe).call(this),n&&d(this,m,ms).call(this,t)},ms=function(t){var n;(n=c(this,m,ge).find(s=>d(this,m,mt).call(this,s)===t))==null||n.focus()},ys=function(t){var s;const n=((s=t==null?void 0:t.closest)==null?void 0:s.call(t,"[data-ns-tab]"))??null;return n===null||n.closest("ns-tabs")!==this?null:n},zt=new WeakMap,Ht=new WeakMap,Vs([v({attribute:!1})],Ae.prototype,"active"),Vs([v({type:String,attribute:"default-active"})],Ae.prototype,"defaultActive"),O("ns-tabs",Ae);const mi=R`
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

  /*
    닫기 버튼도 첫 줄 글자의 세로 중앙에 맞춘다. 점과 같은 이유이고 같은 계산이다 —
    .toast 가 align-items: flex-start 라 버튼이 상자 맨 위에 붙는데, 버튼의 높이는
    아이콘(--ns-icon-size)에 위아래 padding 이 더해진 값이라 줄 높이보다 크다.
    그 차이의 절반만큼 아이콘 중심이 첫 글자 중심보다 내려가 있었다.

    **위아래에 똑같이 준다.** 위만 당기면 버튼이 아래로 그만큼 더 삐져나와 상자
    높이를 늘리지만, 양쪽을 당기면 배치상의 높이가 정확히 한 줄이 되어 한 줄
    메시지에서 토스트가 글자보다 커지지 않는다. 넘치는 만큼은 .toast 의
    padding(--ns-space-3) 안에 들어가므로 상자 밖으로 나가지 않는다.

    지금 값은 우연히 0 이 아니다 — --ns-icon-size 와 --ns-line-height-sm 이 둘 다
    1.25rem 이라 남는 것은 padding 뿐이지만, 그 셋 중 무엇이 바뀌어도 이 식이
    따라간다.
  */
  .close {
    flex-shrink: 0;
    margin-block: calc(
      (var(--ns-line-height-sm) - (var(--ns-icon-size) + var(--ns-space-1) * 2)) / 2
    );
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
`;var yi=Object.defineProperty,Js=(i,e,t,n)=>{for(var s=void 0,o=i.length-1,r;o>=0;o--)(r=i[o])&&(s=r(e,t,s)||s);return s&&yi(e,t,s),s};const Ge=class Ge extends M{constructor(){super(...arguments);p(this,P);p(this,le);p(this,Z);p(this,z);p(this,J);p(this,ce);p(this,de);p(this,he);p(this,ue);this.position="top-center",this.items=[],l(this,le,0),l(this,Z,!1),l(this,z,!1),l(this,J,!1),l(this,ce,()=>{l(this,Z,!0),d(this,P,It).call(this)}),l(this,de,()=>{l(this,Z,!1),d(this,P,It).call(this)}),l(this,he,()=>{l(this,z,!0),d(this,P,It).call(this)}),l(this,ue,()=>{l(this,z,!1),d(this,P,It).call(this)})}connectedCallback(){super.connectedCallback(),U(),d(this,P,_s).call(this)}disconnectedCallback(){d(this,P,ws).call(this),l(this,Z,!1),l(this,z,!1),l(this,J,!1),super.disconnectedCallback()}show(t,n,s){const o=en(this,le)._++,r={key:o,message:t,tone:n,duration:s,remaining:s,startedAt:Date.now()};return this.items=[...this.items,r],c(this,J)||d(this,P,$s).call(this,r),()=>this.dismiss(o)}dismiss(t){const n=this.items.find(s=>s.key===t);n!==void 0&&(n.timer!==void 0&&clearTimeout(n.timer),this.items=this.items.filter(s=>s.key!==t))}updated(){var t;l(this,z,((t=this.shadowRoot)==null?void 0:t.activeElement)!=null),d(this,P,It).call(this)}render(){return A`
      <div
        class="region"
        aria-live="polite"
        @mousemove=${c(this,ce)}
        @mouseleave=${c(this,de)}
        @focusin=${c(this,he)}
        @focusout=${c(this,ue)}
      >
        ${we(this.items,t=>t.key,t=>A`
            <div class="toast ${t.tone}" role=${t.tone==="danger"?"alert":y}>
              ${t.tone==="neutral"?y:A`<span class="dot" aria-hidden="true"></span>`}
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
    `}};le=new WeakMap,Z=new WeakMap,z=new WeakMap,J=new WeakMap,P=new WeakSet,$s=function(t){!Number.isFinite(t.duration)||t.duration<=0||t.timer!==void 0||(t.startedAt=Date.now(),t.timer=window.setTimeout(()=>this.dismiss(t.key),t.remaining))},ws=function(){for(const t of this.items)t.timer!==void 0&&(clearTimeout(t.timer),t.timer=void 0,t.remaining=Math.max(0,t.remaining-(Date.now()-t.startedAt)))},_s=function(){for(const t of this.items)d(this,P,$s).call(this,t)},It=function(){const t=c(this,Z)||c(this,z);t!==c(this,J)&&(l(this,J,t),t?d(this,P,ws).call(this):d(this,P,_s).call(this))},ce=new WeakMap,de=new WeakMap,he=new WeakMap,ue=new WeakMap,Ge.styles=mi;let kt=Ge;Js([v({reflect:!0})],kt.prototype,"position"),Js([ze()],kt.prototype,"items"),O("ns-toast",kt);let Xs="top-center";function $i(){const i=document.querySelector("ns-toast");if(i!==null)return i;const e=document.createElement("ns-toast");return e.position=Xs,document.body.append(e),e}function wi(i){if(Xs=i,typeof document>"u")return;const e=document.querySelector("ns-toast");e!==null&&(e.position=i)}function _i(i,e={}){if(typeof document>"u")return()=>{};const{tone:t="neutral",duration:n=4e3}=e;return $i().show(i,t,n)}function Ys(i,e,t){const n=document.activeElement,s=document.createElement("ns-dialog");s.heading=i.heading??"";const o=document.createElement("p");o.textContent=i.message,o.style.margin="0",s.append(o);let r=!1;const a=u=>{if(r)return;r=!0,s.close();const $=()=>{s.remove(),t(u),n instanceof HTMLElement&&n.isConnected&&n.focus()};s.updateComplete.then($,$)},h=async u=>{for(let $=0;$<5;$++)if(await s.updateComplete,r||(u.focus({preventScroll:!0}),document.activeElement===u))return;console.warn("[ns-confirm] 취소 버튼에 초기 포커스를 주지 못했습니다. ns-dialog 의 갱신 순서가 바뀌었을 수 있습니다.")},b=document.createElement("button");b.type="button",b.slot="footer",b.className=i.tone==="danger"?"ns-button ns-button--danger ns-button--sm":"ns-button ns-button--solid ns-button--sm",b.textContent=i.confirmLabel??"확인",b.addEventListener("click",()=>a(!0));let x=null;if(e){const u=document.createElement("button");u.type="button",u.slot="footer",u.className="ns-button ns-button--outline ns-button--sm",u.textContent=i.cancelLabel??"취소",u.addEventListener("click",()=>a(!1)),i.tone==="danger"&&(x=u),s.append(u)}s.append(b),s.addEventListener("ns-dialog-close",()=>a(!1)),document.body.append(s),s.show(),x!==null&&h(x)}function xi(i){return typeof document>"u"?Promise.resolve():new Promise(e=>{Ys(i,!1,()=>e())})}function Ai(i){return typeof document>"u"?Promise.resolve(!1):new Promise(e=>{Ys(i,!0,e)})}g.NsDialog=T,g.NsHeader=_t,g.NsIcon=Jt,g.NsMultiSelect=N,g.NsNavGroup=F,g.NsNavItem=nt,g.NsPageHeading=xt,g.NsPagination=it,g.NsSidebar=At,g.NsSkeleton=ot,g.NsTable=rt,g.NsTabs=Ae,g.NsToast=kt,g.nsAlert=xi,g.nsConfirm=Ai,g.nsToast=_i,g.nsToastPosition=wi,g.registerIcons=In,g.svg=Vt,g.tabIdFor=Zs,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})}));
