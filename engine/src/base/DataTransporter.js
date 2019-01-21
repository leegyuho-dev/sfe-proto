// DataTransporter.js
const LAYER = 'SFE: ';

/* import {
    getData,
    parseJson,
} from '../common/functions.js'; */

export class DataTransporter {

    constructor() {
        // this.session = {}
    }

    // 서버로부터 세션데이터를 받아온다
    async getSessionData() {
        try {
            const data = await SFE.getData('/xhr.php?call=getSessionData');
            return SFE.parseJson(data);
        } 
        catch (error) {
            throw Error(error);
        }
    }

    // 서버와 SSE 연결을 시작한다
    readyServerEvent() {
        let Server = new EventSource('/sse.php');
        Server.onopen = (function() {
            console.log('SSE:', 'READY');
        });
        Server.onerror = function() {
            console.log('SSE:', 'ERROR');
        };

        Server.addEventListener('message', function(event) {
            // console.log('SSE:', event);
            let data = SFE.parseJson(event.data);
            console.log('SSE:', data.log);
        });
        Server.addEventListener('session', function(event) {
            // console.log('SSE:', event);
            let data = SFE.parseJson(event.data);
            console.log('SSE:', data.log);
        });
    }

}
