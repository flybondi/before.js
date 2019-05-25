const { configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

// React 16 Enzyme adapter
configure({ adapter: new Adapter() });
