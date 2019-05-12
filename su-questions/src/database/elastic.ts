import elasticsearch from 'elasticsearch';
import { ELASTIC_SEARCH_HOST, ELASTIC_INDEX, ELASTIC_TYPE } from '../utils/const';
import { Question } from '../models';

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
    
    public async insert(question: Question) {
        try {
            const q = { ...question };
            delete q['_id'];
            await this.client.index({
                index: ELASTIC_INDEX,
                type: ELASTIC_TYPE,
                id: question._id,
                body: q
            });
        } catch (ex) {
            throw new Error('There was an error inserting question to document: ' + ex);
        }
    }

    public async update(question: Question) {
        try {
            const q = { ...question };
            delete q['_id'];
            await this.client.update({
                index: ELASTIC_INDEX,
                type: ELASTIC_TYPE,
                id: question._id,
                body: { doc: q }
            });
        } catch (ex) {
            throw new Error('There was an error inserting question to document: ' + ex);
        }
    }
    
    public async delete(questionId: string) {
        try {
            await this.client.delete({
                index: ELASTIC_INDEX,
                type: ELASTIC_TYPE,
                id: questionId
            });
        } catch (ex) {
            throw new Error('Unable to delete question from search: ' + ex);
        }
    }
}