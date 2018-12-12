// Rollup plugins
// import babel from 'rollup-plugin-babel';
// import eslint from 'rollup-plugin-eslint';
// import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import replace from 'rollup-plugin-replace';
// import uglify from 'rollup-plugin-uglify';
import { terser } from "rollup-plugin-terser";

export default [
    {
        input: 'engine/src/sfe.js',
        output: {
            file: 'engine/build/sfe.js',
            format: 'iife',
            name: 'SFE',
            sourcemap: false,
        },
        plugins: [
            commonjs(),
            // terser(),
        ]
    },
    {
        input: 'engine/src/sfe.js',
        output: {
            file: 'engine/build/sfe.min.js',
            format: 'iife',
            name: 'SFEmin',
            sourcemap: false,
        },
        plugins: [
            commonjs(),
            terser(),
        ]
    }
];