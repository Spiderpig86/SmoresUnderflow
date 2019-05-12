import * as React from 'react';
import axios from 'axios';
import { Container, Row, ProgressBar, Form, Button, InputGroup } from 'react-bootstrap';

import { MEDIA_API } from '../../../utils/const';
import './UploadComponent.css';

export class Upload extends React.Component {

    public readonly props: any;

    public readonly state: {
        selectedFile: any,
        progress: number,
        fileIds: string[]
    };

    constructor(props: any) {
        super(props);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onUploadHandler = this.onUploadHandler.bind(this);
        this.state = {
            selectedFile: null,
            progress: 0,
            fileIds: []
        };
    }

    public render() {
        return (
            <Container className="mt-3 mb-3">
                <Row>
                    <Form.Group>
                        <p>Upload Your File</p>
                            <div className="input-group">
                                <InputGroup.Prepend>
                                    <Button onClick={ this.onUploadHandler.bind(this) } disabled={ !this.state.selectedFile } variant="primary">Upload</Button>
                                </InputGroup.Prepend>
                                <div className="custom-file">
                                    <input
                                    type="file"
                                    className="custom-file-input"
                                    id="inputGroupFile01"
                                    aria-describedby="inputGroupFileAddon01"
                                    onChange={ this.onChangeHandler }
                                    />
                                    <label className="custom-file-label" htmlFor="inputGroupFile01">
                                    Choose file
                                    </label>
                                </div>
                            </div>
                            { `${this.state.fileIds ? this.state.fileIds.length : 0} ${this.state.fileIds && this.state.fileIds.length > 1  ? 'images' : 'image'} attached.` }
                    </Form.Group>
                    <ProgressBar animated striped className="progress my-3" variant="success" now={this.state.progress} label={`${ Math.round(this.state.progress) }%`} />
                </Row>
            </Container>
        )
    }

    private onChangeHandler(e: any) {
        // Set files to upload
        const files = e.target.files;
        if (this.checkMimeType(e) && this.checkFileSize(e)) {
            this.setState({
                selectedFile: files,
                progress: 0
            });
        }
    }

    private async onUploadHandler() {
        const data = new FormData();
        for (const file of this.state.selectedFile) {
            data.append('content', file);
        }

        // Upload the image
        await axios.post(`${MEDIA_API}`, data, {
            onUploadProgress: (ProgressEvent: any) => {
                console.log(ProgressEvent.loaded / ProgressEvent.total * 100);
                this.setState({
                    progress: (ProgressEvent.loaded / ProgressEvent.total * 100)
                });
            }
        }).then((res: any) => {
            console.log(this);
            console.log(res);
            this.setState({
                selectedFile: null,
                progress: 0,
                fileIds: [...this.state.fileIds, res.data.id]
            });
            this.props.updateMediaIds(this.state.fileIds);
        });
    }

    private checkMimeType(e: any): boolean {
        const files = e.target.files;
        const errors = [];
        const types = ['image/png', 'image/jpeg', 'image/gif'];

        // Loop over the files user uploaded
        for (let i = 0; i < files.length; i++) {
            // Loop over all valid file types
            if (types.every(type => files[i].type !== type)) {
                errors[i] = `File ${i} with type ${files[i].type} is not a support file type.`;
            }
        }
        
        for (const err of errors) {
            alert(err);
            e.target.value = null;
        }

        return true;
    }

    private checkFileSize(e: any) {
        const files = e.target.files;
        const MAX = 20000000;
        const errors = [];

        // Loop over the files user uploaded
        for (let i = 0; i < files.length; i++) {
            // Loop over all valid file types
            if (files[i].size > MAX) {
                errors[i] = `File ${i} is too large.`;
            }
        }
        
        for (const err of errors) {
            alert(err);
            e.target.value = null;
        }

        return true;
    }
}