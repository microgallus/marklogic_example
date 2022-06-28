var flatMap = require('array.prototype.flatmap');
const {TextEncoder, TextDecoder} = require("fastestsmallesttextencoderdecoder-encodeinto");
const btoa = require("core-js/stable/btoa")
delete Array.prototype.flatMap;
var shimmedFlatMap = flatMap.shim();

const arrow = require('apache-arrow')



const LENGTH = 2000;

const rainAmounts = Float32Array.from(
    { length: LENGTH },
    () => Number((Math.random() * 20).toFixed(1)));

const rainDates = Array.from(
    { length: LENGTH },
    (_, i) => new Date(Date.now() - 1000 * 60 * 60 * 24 * i));

const rainfall = arrow.tableFromArrays({
    precipitation: rainAmounts,
    date: rainDates
});

table =  arrow.tableToIPC(rainfall)

hex_manual = table
        .map(x => x.toString(16).padStart(2,'0'))
        .join('');

let b64 = xs.base64Binary(btoa(table))
let hex = xs.hexBinary(b64)

function toHexString(bytes) {
    let result = ''
    for (let byte of bytes) {
        result = result + byte.toString(16).padStart(2, '0')
    }
    return result
}

const builder = new NodeBuilder();
builder.startDocument('rainfall.arrow')
builder.addBinary(hex);
builder.endDocument()
let node = builder.toNode()
return [table.length, xdmp.binarySize(fn.head(node).root), xs.length(hex)]
