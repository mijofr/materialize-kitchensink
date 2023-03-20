
export class Component {

  constructor(classDef, protected el: Element, protected options) {
    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error(Error(el + ' is not an HTML Element'));
    }
    // If exists, destroy and reinitialize in child
    let ins = classDef.getInstance(el);
    if (!!ins) {
      ins.destroy();
    }
    this.el = el;
  }

  static init(classDef, els, options) {
    let instances = null;
    if (els instanceof Element) {
      instances = new classDef(els, options);
    }
    else if (!!els && (els.jquery || els.cash || els instanceof NodeList || els instanceof HTMLCollection)) {
      let instancesArr = [];
      for (let i = 0; i < els.length; i++) {
        instancesArr.push(new classDef(els[i], options));
      }
      instances = instancesArr;
    }
    return instances;
  }
}
