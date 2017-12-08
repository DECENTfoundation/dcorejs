var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Database } from '../api/database';
var DatabaseApiMock = (function (_super) {
    __extends(DatabaseApiMock, _super);
    function DatabaseApiMock() {
        return _super.call(this) || this;
    }
    DatabaseApiMock.prototype.execute = function (operation, parameters) {
        return new Promise(function (resolve, reject) {
        });
    };
    return DatabaseApiMock;
}(Database));
export { DatabaseApiMock };
//# sourceMappingURL=DatabaseApiMock.js.map