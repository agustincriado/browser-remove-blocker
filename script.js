const targetNode = document.body
// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };
function isValidHTMLTag(nodeName) {
  // Regular expression pattern to match valid HTML tag names
  var validTagPattern = /^[a-zA-Z][a-zA-Z0-9]*$/;
  return validTagPattern.test(nodeName);
}
async function obliterateDIDOMI() {
  const promise = new Promise((resolve, reject) => {
    const badNodes = Array.from(document.querySelectorAll('[class^="didomi"]'))
    if (badNodes.length) {
      document.getElementById('didomi-host').remove()
      document.body.classList.remove('didomi-popup-open')
    }
    resolve()
  })
  return promise
}
function checkChildNode (child) {
  if (isValidHTMLTag(child.nodeName) && child.localName !== 'script' && child.localName !== 'style' && child.localName !== 'img' && child.localName !== 'iframe') {
    const elementRect = child.getBoundingClientRect();
    const viewportRect = {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      right: window.innerWidth
    };
    
    // Check if the element's bounding rectangle intersects with the viewport's bounding rectangle
    const isIntersecting = !(
      elementRect.bottom < viewportRect.top ||
      elementRect.top > viewportRect.bottom ||
      elementRect.right < viewportRect.left ||
      elementRect.left > viewportRect.right
      );
      
    if (!isIntersecting && (elementRect.width > 250 && elementRect.height > 250)) {
      child.setAttribute('style', 'display: none !important;')
    } else {
      const computedStyles = window.getComputedStyle(child)
      if (parseInt(computedStyles.zIndex) > 500) {
        child.setAttribute('style', 'display: none !important;')
      }
    }
    if (elementRect.height === 0 && elementRect.width !== 0) {
      child.setAttribute('style', 'display: none !important;')
    }
  } 
}
function checkBodyAndParent () {
  const computedStyles = window.getComputedStyle(targetNode)
  if (computedStyles.overflow && computedStyles.overflow === 'hidden') {
    targetNode.removeAttribute('style')
  }
  targetNode.setAttribute('style', 'overflow: auto !important')
  const parentNode = targetNode.parentNode
  const computedStylesParent = window.getComputedStyle(parentNode)
  if (computedStylesParent.overflow && computedStylesParent.overflow === 'hidden') {
    targetNode.parentNode.removeAttribute('style')
  }
}
// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  new Promise((resolve, reject) => {
    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        if (mutation.target === targetNode && mutation.attributeName === 'style') {
          checkBodyAndParent()
        }
      } else {
        if (mutation.addedNodes.length) {
          const nodesArray = Array.from(mutation.addedNodes)
          nodesArray.forEach(child => checkChildNode(child))
        }
      }
    }
    resolve()
  })
};
async function init() {
  await obliterateDIDOMI()
  await checkBodyAndParent()
  
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  const bodyChildren = Array.from(document.body.children)
  bodyChildren.forEach(child => checkChildNode(child))
  setTimeout(() => {
  observer.disconnect()
  }, 5000)
}
init()