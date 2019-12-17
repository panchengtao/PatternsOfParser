var expect = require('expect');
var {BacktrackLexer, BacktrackParser} = require('./btparser');

describe('test ListLexer', () => {
    it('should not throw error', () => {
        let lexer = new BacktrackLexer('[a,b] = [c,d]');
        let parser = new BacktrackParser(lexer);

        expect(() => {
            parser.stat()
        }).toBeDefined()
    });

    it('should not throw error too', () => {
        let lexer = new BacktrackLexer('[a, b = c, [d, e]]');
        let parser = new BacktrackLexer(lexer, 2);

        expect(() => {
            parser.stat()
        }).toBeDefined()

    });
});