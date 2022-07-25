/* eslint-disable */
/*
Copyright (c) 2014 Mike Ferron (mikeferron.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.

*/

const Vector2D = (function () {
  function a(a, b) {
    (this.x = a || 0), (this.y = b || 0);
  }
  var b, c, d, e, f;
  for (
    f = ["add", "subtract", "multiply", "divide", "dot"],
      c = function (b) {
        return (a[b] = function (a, c) {
          return a.duplicate()[b](c);
        });
      },
      d = 0,
      e = f.length;
    e > d;
    d++
  )
    (b = f[d]), c(b);
  return (
    (a.lerp = function (a, b, c) {
      return b.duplicate().subtract(a).multiply(c).add(a);
    }),
    (a.fromAngle = function (b) {
      return new a(Math.cos(b), Math.sin(b));
    }),
    (a.random = function () {
      return new a.fromAngle(
        Math.floor(Math.random() * (2 * Math.PI - 0 + 1)) + 0
      );
    }),
    (a.prototype.zero = function () {
      return (this.x = this.y = 0), this;
    }),
    (a.prototype.abs = function () {
      return (this.x = Math.abs(this.x)), (this.y = Math.abs(this.y)), this;
    }),
    (a.prototype.duplicate = function () {
      return new a(this.x, this.y);
    }),
    (a.prototype.clone = a.prototype.duplicate),
    (a.prototype.magnitude = function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }),
    (a.prototype.length = a.prototype.magnitude),
    (a.prototype.negative = function () {
      return this.multiply(-1);
    }),
    (a.prototype.reverse = a.prototype.negative),
    (a.prototype.normalize = function () {
      var a = this.magnitude();
      return a > 0 && this.divide(a), this;
    }),
    (a.prototype.unit = a.prototype.normalize),
    (a.prototype.limit = function (a) {
      return this.magnitude() > a ? (this.normalize(), this.multiply(a)) : this;
    }),
    (a.prototype.heading = function () {
      return -1 * Math.atan2(-1 * this.y, this.x);
    }),
    (a.prototype.eucl_distance = function (a) {
      var b, c;
      return (b = this.x - a.x), (c = this.y - a.y), Math.sqrt(b * b + c * c);
    }),
    (a.prototype.distance = function (a, b) {
      var c, d;
      return (
        null === b && (b = !1),
        (c = Math.abs(this.x - a.x)),
        (d = Math.abs(this.y - a.y)),
        b &&
          ((c = c < b.width / 2 ? c : b.width - c),
          (d = d < b.height / 2 ? d : b.height - d)),
        Math.sqrt(c * c + d * d)
      );
    }),
    (a.prototype.add = function (a) {
      return (this.x += a.x), (this.y += a.y), this;
    }),
    (a.prototype.subtract = function (a) {
      return (this.x -= a.x), (this.y -= a.y), this;
    }),
    (a.prototype.multiply = function (a) {
      return (this.x = this.x * a), (this.y = this.y * a), this;
    }),
    (a.prototype.divide = function (a) {
      return (this.x = this.x / a), (this.y = this.y / a), this;
    }),
    (a.prototype.dot = function (a) {
      return this.x * a.x + this.y * a.y;
    }),
    (a.prototype.lerp = function (a, b) {
      return (
        (this.x = this.x + b * (a.x - this.x)),
        (this.y = this.y + b * (a.y - this.y)),
        this
      );
    }),
    (a.prototype.projectOnto = function (a) {
      return a.duplicate().multiply(this.dot(a));
    }),
    (a.prototype.wrapRelativeTo = function (a, b) {
      var c, d, e, f, g, h;
      (g = this.duplicate()), (h = { x: "width", y: "height" });
      for (c in h)
        (e = h[c]),
          (d = this[c] - a[c]),
          (f = b[e]),
          Math.abs(d) > f / 2 &&
            (g[c] = d > 0 ? -1 * (f - this[c]) : this[c] + f);
      return g;
    }),
    (a.prototype.equals = function (a) {
      return this.x == a.x && this.y == a.y;
    }),
    (a.prototype.invalid = function () {
      return (
        1 / 0 === this.x || isNaN(this.x) || 1 / 0 === this.y || isNaN(this.y)
      );
    }),
    a
  );
})();

export default Vector2D;
