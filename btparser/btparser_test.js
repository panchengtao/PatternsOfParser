var expect = require('expect');
var {BacktrackLexer, BacktrackParser} = require('./btparser');

describe('test ListLexer', () => {
    it('should not throw error', () => {
        let lexer = new BacktrackLexer('[a, [a , b] = [b , c]]');
        let parser = new BacktrackParser(lexer);

        parser.stat();
        expect(() => {
            parser.stat()
        }).toBeDefined()
    });

    it('should not throw error too', () => {
        let lexer = new ListLexer('[a, b = c, [d, e]]');
        let parser = new ListParser(lexer, 2);

        expect(() => {
            parser.list()
        }).toBeDefined()

    });

    it('should throw error', () => {
        let lexer = new ListLexer('[a, ,b = c]');
        let parser = new ListParser(lexer, 2);

        expect(() => {
            parser.list()
        }).toThrow(`Expecting name or list; Found <',',COMMA>`)
    });

    it('should throw error too', () => {
        let lexer = new ListLexer('[a, /b = c]');
        let parser = new ListParser(lexer, 2);

        expect(() => {
            parser.list()
        }).toThrow(`Invalid character: /`)
    })
});