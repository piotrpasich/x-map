import React, { Component } from 'react';
import { Link } from 'react-router';
import DocumentTitle from 'react-document-title';

class NotFound extends Component {
  render() {
    return (
      <DocumentTitle title="Page Not Found | X-Map">
        <article id="NotFound" className="page card">
          <Link to="/" className="close btn btn-sm btn-secondary">&times;</Link>

          <header className="card-header">
            <h3 className="card-title">Page not found.</h3>
          </header>
        </article>
      </DocumentTitle>
    );
  }
}

export default NotFound;
