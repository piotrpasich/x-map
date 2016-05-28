import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import DateRangePicker from 'react-daterange-picker';

/* Components */
import ErrorList from '../forms/ErrorList';

class ConferenceForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = props.conference;
  }

  onSubmit(e) {
    e.preventDefault();
    const { onSubmit, onSuccess } = this.props;
    onSubmit(this.state, onSuccess);
  }

  onInputChange(field, e) {
    this.setState({[field]: e.target.value});
  }

  handleDateRangeSelect(range) {
    this.setState({
      dateStart: range.start.format('YYYY-MM-DD'),
      dateEnd: range.end.format('YYYY-MM-DD')
    });
  }

  renderDatePicker() {
    return (
      <DateRangePicker
        firstOfWeek={1}
        selectionType="range"
        onSelect={this.handleDateRangeSelect.bind(this)} />
    );
  }

  render() {
    const { errors } = this.props;

    const cancelLink = (this.state.id) ? ('/conference/' + this.state.id) : '/conferences';

    return (
      <div id="ConferenceForm">
        <ErrorList errors={errors} showFieldErrors/>
        <form onSubmit={this.onSubmit.bind(this)}>
          <fieldset className="form-group">
            <label>Conference name</label>
            <input type="text" className="form-control" placeholder="Name" value={this.state.name}
              minLength="2" maxLength="32" onChange={this.onInputChange.bind(this, 'name')} required/>
            <small className="text-muted"><strong>Required.</strong> Min. length: 2 characters. Max. length: 32 characters.</small>
          </fieldset>

          <fieldset className="form-group">
            <label>Description</label>
            <textarea className="form-control" placeholder="Description" value={this.state.description}
                      maxLength="1024" rows="5" onChange={this.onInputChange.bind(this, 'description')}/>
            <small className="text-muted">Max. length: 1024 characters.</small>
          </fieldset>

          <fieldset className="form-group">
            <label>Conference dates</label>
            {this.renderDatePicker()}
          </fieldset>

          <fieldset className="form-group">
            <button className="btn btn-primary" type="submit">Save</button>
            <span> </span>
            <Link className="btn btn-secondary" to={cancelLink} title="Cancel editing">Cancel</Link>
          </fieldset>
        </form>
      </div>
    );
  }
}

ConferenceForm.propTypes = {
  conference: PropTypes.shape({
    id: PropTypes.string
  }),
  errors: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

ConferenceForm.defaultProps = {
  conference: {}
};

export default ConferenceForm;
