import elasticsearch from 'elasticsearch';
import { ELASTIC_SEARCH_HOST, ELASTIC_INDEX, ELASTIC_TYPE } from '../utils/const';
import { Parameter } from '../models/parameter';

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

    public async search(parameters: Parameter) {
        // query, limit, sortbyfilter, hasmedia, accepted
        const sortBy = {
            [parameters.variables.sort_by ? parameters.variables.sort_by : 'score']: { order: 'desc' }
        };

        const tags = [];
        if (parameters.variables.tags) {
            for (const tag of parameters.variables.tags) {
                tags.push({
                    term: {
                        'tags.keyword': tag
                    }
                });
            }
        }

        const filters = [];
        if (parameters.variables.has_media) {
            filters.push({
                script: { script: "doc['media'].size() > 0" }
            });
        }
        if (parameters.variables.accepted) {
            filters.push({
                exists: {
                    field: "acceptedAnswer"
                }
            });
        }

        const queries = [];
        if (parameters.variables.q) {
            queries.push({
                match: {
                    title: parameters.variables.q
                }
            });
            queries.push({
                match: {
                    body: parameters.variables.q
                }
            });
        }


        const response = await this.client.search({
            index: ELASTIC_INDEX,
            type: ELASTIC_TYPE,
            body: {
                sort: [
                    sortBy
                ],
                size: parameters.variables.limit,
                query: {
                    bool: { // Work on this to work if tag search is enabled (used be called filtered in older versions)
                        must: tags,
                        filter: {
                            bool: {
                                must: filters,
                                should: queries,
                            }
                        }
                    }
                }
            }
        });

        return response.hits.hits;
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
            // await this.client.indices.delete({
            //     index: '_all'
            // });
        } catch (ex) {
            throw new Error('Unable to delete index: ' + ex);
        }
    }
}

// PUT THIS MODEL INTO ELASTICSEARCH
// PUT smores/_mapping/question
// {
//    "question": {
//       "properties" : {
//           "body" : {
//             "type" : "text",
//             "fields" : {
//               "keyword" : {
//                 "type" : "keyword",
//                 "ignore_above" : 256
//               }
//             }
//           },
//           "media" : {
//             "type" : "text",
//             "fielddata": true,
//             "fields" : {
//               "keyword" : {
//                 "type" : "keyword",
//                 "ignore_above" : 256
//               }
//             }
//           },
//           "tags" : {
//             "type" : "text",
//             "fields" : {
//               "keyword" : {
//                 "type" : "keyword",
//                 "ignore_above" : 256
//               }
//             }
//           },
//           "timestamp" : {
//             "type" : "float"
//           },
//           "title" : {
//             "type" : "text",
//             "fields" : {
//               "keyword" : {
//                 "type" : "keyword",
//                 "ignore_above" : 256
//               }
//             }
//           },
//           "user" : {
//             "properties" : {
//               "_id" : {
//                 "type" : "text",
//                 "fields" : {
//                   "keyword" : {
//                     "type" : "keyword",
//                     "ignore_above" : 256
//                   }
//                 }
//               },
//               "email" : {
//                 "type" : "text",
//                 "fields" : {
//                   "keyword" : {
//                     "type" : "keyword",
//                     "ignore_above" : 256
//                   }
//                 }
//               },
//               "reputation" : {
//                 "type" : "long"
//               },
//               "username" : {
//                 "type" : "text",
//                 "fields" : {
//                   "keyword" : {
//                     "type" : "keyword",
//                     "ignore_above" : 256
//                   }
//                 }
//               }
//             }
//           },
//           "viewCount" : {
//             "type" : "long"
//           }
//         }
//    }
// }