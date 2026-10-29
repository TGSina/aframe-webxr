// Workaround: some Android Chrome versions don't composite WebXR projection layers (AR/VR).
// Hiding the layers API makes three.js / A-Frame use the classic XRWebGLLayer path.
//   ?xrlayers=1  keep Chrome's layers path (A/B test)      ?xrlayers=0  force-disable everywhere
(() => {
  window.__xrLayersDisabled = false;
  const mode = new URLSearchParams(location.search).get('xrlayers');
  const ua = navigator.userAgent;
  const isPhone = /Android/.test(ua) && /Mobile/.test(ua) && !/OculusBrowser|Quest/.test(ua);
  if (mode === '1' || (mode !== '0' && !isPhone)) return;
  try {
    if (typeof XRWebGLBinding !== 'undefined' && 'createProjectionLayer' in XRWebGLBinding.prototype) {
      delete XRWebGLBinding.prototype.createProjectionLayer;
      window.__xrLayersDisabled = true;
    }
    if (typeof XRRenderState !== 'undefined' && 'layers' in XRRenderState.prototype) {
      delete XRRenderState.prototype.layers;
    }
  } catch (e) { console.warn('xr-compat failed', e); }
})();