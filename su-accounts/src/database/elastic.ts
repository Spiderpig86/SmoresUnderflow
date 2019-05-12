import elasticsearch from 'elasticsearch';
import { ELASTIC_SEARCH_HOST, ELASTIC_INDEX, ELASTIC_TYPE } from '../utils/const';

export class Elastic {

    private client: elasticsearch.Client;

    constructor() {
        this.client = new elasticsearch.Client({
            host: ELASTIC_SEARCH_HOST,
            // log: 'trace'
        });
        this.checkConnection();
    }

    public async checkConnection(): Promise<void> {
        // Check if connection alive
        await this.client.ping({ requestTimeout: 10000 });
        console.log('Search pinged');
    }

    public async deleteAll(): Promise<void> {
        try {
            await this.client.deleteByQuery({
                index: ELASTIC_INDEX,
                type: ELASTIC_TYPE,
                body: {
                    query: {
                        match_all: {}
                    }
                }
            });
        } catch (ex) {
            throw new Error('Unable to delete index: ' + ex);
        }
    }
}