class Assert {

    assert(message) {
        if (typeof message === 'object') message = JSON.stringify(message);
        if (message) {
            console.error(message);
            console.log();
        }
        throw new AssertionError(message);
    }

    assertFalse(o, message) {
        if (o === null || o === undefined || o === false) {
            return;
        }
        if (!message) {
            let s = '' + o;
            if (typeof o === 'string') o = `"${o}"`;
            const w = 40;
            if (s.length > w) s = s.substring(0, w - 4) + '...';
            if (s.length > 0) s = ' for ' + s;
            message = 'Assertion False failed' + s;
        }
        this.assert(message);
    }

    assertTrue(o, message) {
        if (o !== null && o !== undefined && (o === true || !!o)) {
            return;
        }
        if (!message) {
            message = 'Assertion True failed'
        }
        this.assert(message);
    }

    assertNull(o, message) {
        if (o === null || o === undefined) {
            return;
        }
        if (!message) {
            let s = '' + message;
            const w = 40;
            if (s.length > w) s = s.substring(0, w - 4) + '...';
            if (s.length > 0) s = ` for "${s}"`;
            message = 'Assertion Null failed' + s;
        }
        this.assert(message);
    }

    assertNotNull(o, message) {
        if (o !== null && o !== undefined) {
            return;
        }
        if (!message) {
            message = 'Assertion NotNull failed'
        }
        this.assert(message);
    }

    assertEmpty(o, message) {
        if (o === null || o === undefined) {
            return;
        }
        if (typeof o === 'object') {
            if (Array.isArray(o)) {
                if (o.length === 0) {
                    return;
                }
            } else {
                if (Object.keys(o).length === 0) {
                    return;
                }
            }
        } else if (typeof o === 'string') {
            if (o.length === 0) {
                return;
            }
        }
        if (!message) {
            let s = '' + o;
            const w = 40;
            if (s.length > w) s = s.substring(0, w - 4) + '...';
            if (s.length > 0) s = ` for "${s}"`;
            message = 'Assertion Empty failed' + s;
        }
        this.assert(message);
    }

    assertNotEmpty(o, message) {
        if (o !== null && o !== undefined) {
            if (typeof o === 'object') {
                if (Array.isArray(o)) {
                    if (o.length > 0) {
                        return;
                    }
                } else if (Object.keys(o).length > 0) {
                    return;
                }
            } else if (typeof o === 'string') {
                if (o.length > 0) {
                    return;
                }
            } else {
                return;
            }
        }
        if (!message) {
            message = 'Assertion NotEmpty failed'
        }
        this.assert(message);
    }

    assertEquals(check, value, message) {
        if (check == undefined && value == undefined) return;
        if (check == undefined || value == undefined || check != value) {
            if (!message) {
                const array = [];
                if (check != undefined) array.push('' + check);
                if (value != undefined) array.push('' + value);
                message = 'Assertion Equals failed';
                if (array.length > 0) message += ` for "${array.join('" <> "')}"`;
            }
            this.assert(message);
        }
    }

    assertNotEquals(o, value, message) {
        const valueSpecified = value !== null && value !== undefined;
        if (o === null || o === undefined) {
            if (valueSpecified) {
                return;
            }
        } else {
            if (!valueSpecified) {
                return;
            }
            if (o != value) {
                return;
            }
        }
        if (!message) {
            message = `Assertion NotEquals failed for "${value}"`;
        }
        this.assert(message);
    }

}

class AssertionError extends Error {

    constructor(message) {
        super(message);
    }

}

module.exports = {
    Assert,
    AssertionError
};
