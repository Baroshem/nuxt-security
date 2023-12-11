function loader() {
  let script = document.createElement('script');
  script.src = 'external.js';

  // add to the DOM
  document.head.appendChild(script);
}

loader();
