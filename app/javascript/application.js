// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import * as bootstrap from "bootstrap"
window.bootstrap = bootstrap

import "chartkick/chart.js"

import {TabulatorFull as Tabulator} from 'tabulator-tables';
window.Tabulator = Tabulator;
