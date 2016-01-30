import {
  MAP_MODE_SELECT,
  MAP_MODE_SHOW
} from '../../constants/AppConstants';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../actions/UserActions';
import GoogleMapsLoader from 'google-maps';
import deepEqual from 'deep-equal';

import blueMarker from '../../../img/blueMarker.png';
import 'file?name=[name].[ext]!../../../img/blueMarker.png';

// https://developers.google.com/maps/documentation/javascript/reference
// https://developers.google.com/maps/documentation/javascript/libraries
// https://developers.google.com/maps/documentation/javascript/controls

class Map extends Component {
  componentDidMount() {
    GoogleMapsLoader.load(this.configureMap.bind(this));
  }

  componentDidUpdate(prevProps) {
    if (!deepEqual(this.props.users, prevProps.users)) {
      this.loadData();
    }
    this.updateCurrentLocationMarker();
    this.updateMapStyle();
  }

  configureMap(google) {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 0, lng: 50},
      zoom: 2,
      minZoom: 2,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeIds: [
        google.maps.MapTypeId.HYBRID,
        google.maps.MapTypeId.ROADMAP,
        google.maps.MapTypeId.SATELLITE,
        google.maps.MapTypeId.TERRAIN
      ],
      scaleControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      }
    });

    this.currentLocationMarker = new google.maps.Marker({
      icon: blueMarker
    });

    google.maps.event.addListener(this.map, 'click', event => {
      if (this.props.mapMode === MAP_MODE_SELECT) {
        this.currentLocationMarker.setPosition(event.latLng);
        this.props.actions.userSelectedLocation(event.latLng.lat(), event.latLng.lng());
      }
    });

    this.map.data.addListener('click', event => {
      if (this.props.mapMode === MAP_MODE_SHOW && this.props.onFeatureClick) {
        this.props.onFeatureClick(event.feature.getId());
      }
    });

    this.loadData();
    this.updateMapStyle();
  }

  loadData() {
    this.map.data.addGeoJson(this.props.users);
  }

  updateCurrentLocationMarker() {
    if (this.props.currentLocation) {
      this.currentLocationMarker.setPosition(this.props.currentLocation);
      this.currentLocationMarker.setMap(this.props.mapMode === MAP_MODE_SELECT ? this.map : null);
    }
  }

  updateMapStyle() {
    this.map.data.setStyle(feature => {
      if (this.props.mapMode === MAP_MODE_SELECT) {
        return {
          visible: false
        };
      }

      if (this.props.activeUserIds.indexOf(feature.getId()) !== -1) {
        return {
          icon: blueMarker
        };
      }
    });
  }

  render() {
    return (
      <div id="map"></div>
    );
  }
}

Map.propTypes = {
  users: PropTypes.object.isRequired,
  activeUserIds: PropTypes.array,
  mapMode: PropTypes.oneOf([MAP_MODE_SELECT, MAP_MODE_SHOW]).isRequired,
  currentLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  actions: PropTypes.object.isRequired,
  onFeatureClick: PropTypes.func
};

Map.defaultProps = {
  mapMode: MAP_MODE_SHOW
};

function mapStateToProps(state) {
  return {
    users: state.geoData,
    activeUserIds: state.session.activeUserIds,
    currentLocation: state.session.currentLocation,
    mapMode: state.session.mapMode
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UserActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
