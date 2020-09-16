const fromHexString = (hexString: string) =>
  new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

const toHexString = (byteArray: Uint8Array) => {
  var s = "0x";
  byteArray.forEach((byte) => {
    s += ("0" + (byte & 0xff).toString(16)).slice(-2);
  });
  return s;
};

export { fromHexString, toHexString };
