interface FindParameters {
  timestamp: any;
  $text?: any;
  tags?: any;
  $where?: string;
}

interface SearchVariables {
  timestamp: number;
  limit: number;
  q: string;
  sort_by: any;
  tags: string[];
  has_media: boolean;
  accepted: boolean;
}

interface SortParameters {
  timestamp?: number;
  score?: number;
}

export class Parameter {
  variables: SearchVariables;
  find: FindParameters;
  limit: number;
  sort: SortParameters;

  constructor(details: any) {
    this.variables = {
      ...details,
      timestamp: details && details.timestamp ? details.timestamp : new Date().getTime(),
      limit: details && details.limit && details.limit < 101 ? details.limit : 25,
      has_media: details && details.has_media ? true : false,
      accepted: details && details.accepted ? true : false
    };

    this.limit = this.variables.limit;
    this.sort = this.buildSortBy();
    this.find = this.buildFindParameters();
  }

  private buildSortBy() {
    
    const { sort_by } = this.variables;
    if (sort_by && sort_by === 'timestamp') {
      return { timestamp: -1 };
    }
    return { score: -1 };
  }

  private buildWhereString() {
    const { accepted, has_media} = this.variables;
    let where = accepted ? 'this.acceptedAnswer && ' : '';

    if (has_media) {
      where += 'this.media.length > 0';
    } else {
      where += 'this.media.length >= 0';
    }

    return where;
  }

  private buildFindParameters() {
    const { timestamp, tags, q } = this.variables;
    const find: FindParameters = {
      timestamp: { $lte: timestamp },
      $where: this.buildWhereString()
    };
    if (tags) {
      find.tags = { $all: tags };
    }
    if (q) {
      find.$text = { $search: q };
    }
    return find;
  }
}