/**
 * 词法解析器
 * 在 01.js 的基础上，支持 LL(k), k > 1。递归下降解析
 *
 */
const EOF = -1;
const EOF_TYPE = 1;

class Lexer {
    constructor(input) {
        this.input = input; // 输入的字符串
        this.index = 0; // 当前字符串的索引位置
        this.char = input[this.index] // 当前字符
    }

    consume() { // 向前移动一个字符
        this.index += 1;
        if (this.index >= this.input.length) { // 判断是否到末尾
            this.char = EOF
        } else {
            this.char = this.input[this.index]
        }
    }

    match(char) { // 判断输入的 char 是否为当前的 this.char
        if (this.char === char) {
            this.consume()
        } else {
            throw new Error(`Expecting ${char}; Found ${this.char}`)
        }
    }
}

Lexer.EOF = EOF;
Lexer.EOF_TYPE = EOF_TYPE;

const NAME = 2;
const COMMA = 3;
const LBRACK = 4;
const RBRACK = 5;
const EQUALS = 6;
const tokenNames = ['n/a', '<EOF>', 'NAME', 'COMMA', 'LBRACK', 'RBRACK', 'EQUALS'];
const getTokenName = index => tokenNames[index];

// 判断输入字符是否为字母，即在 a-zA-Z 之间
const isLetter = char => char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z';

class ListLexer extends Lexer {
    constructor(input) {
        super(input)
    }

    isLetter() {
        return isLetter(this.char)
    }

    nextToken() {
        while (this.char !== EOF) {
            // 为每一个词法单元构建一个 T()，如 WS(), NAME()
            switch (this.char) {
                case ' ':
                case '\t':
                case '\n':
                case '\r':
                    this.WS();
                    break;
                case ',':
                    this.consume();
                    return new Token(COMMA, ',');
                case '[':
                    this.consume();
                    return new Token(LBRACK, '[');
                case ']':
                    this.consume();
                    return new Token(RBRACK, ']');
                case '=':
                    this.consume();
                    return new Token(EQUALS, '=');
                default:
                    if (this.isLetter()) {
                        return this.NAME()
                    }
                    throw new Error(`Invalid character: ${this.char}`)
            }
        }
        return new Token(EOF_TYPE, '<EOF>')
    }

    WS() { // 忽略所有空白，换行，tab，回车符等
        while (this.char === ' ' || this.char === '\t' || this.char === '\n' || this.char === '\r') {
            this.consume()
        }
    }

    NAME() { // 匹配一列字母
        let name = '';
        while (this.isLetter()) {
            name += this.char;
            this.consume()
        }
        return new Token(NAME, name)
    }
}

class Token {
    constructor(type, text) {
        this.type = type;
        this.text = text
    }

    toString() {
        let tokenName = tokenNames[this.type];
        return `<'${this.text}',${tokenName}>`
    }
}

// 回溯模式语法解析器
class Parser {
    constructor(lexer) { // lexer 词法解析类的实例
        this.lexer = lexer;
        this.markers = [];  // 栈，存放用于记录位置的位标
        this.lookahead = []; // 预读 token 列表
        this.p = 0; // index of current token in lookahead buffer
        sync(1);
    }

    consume() {
        this.index++;
        // have we hit end of buffer when not backtracking?
        if (this.index === this.lookahead.length && !isSpeculating()) {
            // if so, it's an opportunity to start filling at index 0 again
            this.index = 0;
            this.lookahead = [];
        }
        sync(1); // get another to replace consumed token
    }

    isSpeculating() {
        return this.markers.length > 0;
    }

    /** Make sure we have i tokens from current position p (valid tokens from index p to p+i-1). */
    sync(n) {
        if (this.p + n - 1 > this.lookahead.length - 1) { // 检验词法单元是否越界
            let n = (p + n - 1) - (this.lookahead.length - 1);
            this.fill(n);
        }
    }

    fill(n) {  // add n tokens to lookahead
        for (let i = 1; i <= n; i++) {
            this.lookahead.push(this.lexer.nextToken());
        }
    }

    getToken(n) {
        sync(n);
        return this.lookahead(this.index + n - 1);
    }

    getTokenType(n) {
        return this.getToken(n).type
    }

    match(type) {
        let tokenType = this.getTokenType(1);
        if (tokenType === type) {
            this.consume()
        } else {
            throw new Error(`Expecting ${getTokenName(type)}; Found ${this.getToken()}`)
        }
    }

    /** Push current token index to stack */
    mark() {
        this.markers.add(this.index);
        return this.index;
    }

    /** Pop the token index of the stack.
     *  Rewind p to that position.
     *  Rewinding the input is kind of undoing the `consume` */
    release() {
        let marker = this.markers[this.markers.length - 1];
        this.markers.remove(this.markers.length - 1);
        seek(marker);
    }

    /** Rewind p to index */
    seek(index) {
        this.index = index;
    }
}

class BacktrackParser extends Parser {
    constructor(lexer) {
        super(lexer);
    }

    stat() {

    }

    speculate_stat_alt1() {

    }

    speculate_stat_alt2() {

    }

    assign() {

    }

    list() {
        this.match(LBRACK);
        this.elements();
        this.match(RBRACK)
    }

    elements() {
        this.element();
        while (this.getTokenType(1) === COMMA) {
            this.match(COMMA);
            this.element()
        }
    }

    element() {
        // LL(2) 情况下，只能预读最多两个词法单元，所以隐含一个充分条件，但是 lookahead 其实不需要采用环形的方式，而是可以采用无限长序列的方式
        let tokenType1 = this.getTokenType(1);
        let tokenType2 = this.getTokenType(2);

        if (tokenType1 === NAME && tokenType2 === EQUALS) {
            this.match(NAME);
            this.match(EQUALS);
            this.match(NAME)
        } else if (tokenType1 === NAME) {
            this.match(NAME)
        } else if (tokenType1 === LBRACK) {
            this.list()
        } else {
            throw new Error(`Expecting name or list; Found ${this.getToken(1)}`)
        }
    }
}
