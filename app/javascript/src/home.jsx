import React from 'react';
import ReactDOM from 'react-dom';
import { handleErrors, safeCredentials } from '@utils/fetchHelper';
import 'dotenv/config';
import Layout from '@src/layout';
import Filters from '@src/filters';

import './home.scss';

class Home extends React.Component {
  state = {
    realms: {},
    region: ['us', 'eu', 'kr', 'tw'],
    characterData: {},
    realmList: [],
    userRegion: '',
    userRealm: '',
    userCharacter: '',
    profileError: '',
    characterError: '',
    showToast: false,
    profileSuccess: false,
    characterSuccess: false,
  }

  componentDidMount() {
    this.getRealms();
  }

  // This function is to get the realms for the realm list
  getRealms = () => {
    fetch('/api/calls/realms/')
      .then(handleErrors)
      .then(data => {
        console.log(data)
        this.setState({
          realms: data,
        })
      })
  }

  // This function is to get the character's profile
  getProfile = () => {
    // Reset profileError so it doesn't persist
    this.setState({
      profileError: '',
    })

    // If any of the fields are blank, display an error
    if (this.state.userRegion === '' || this.state.userRealm === '' || this.state.userCharacter === '') {
      this.setState({
        profileError: 'Please fill out all fields',
      }, () => {
        this.showToast();
      })
      return;
    }

    fetch(`/api/calls/profile/${this.state.userRegion}/${this.state.userRealm}/${this.state.userCharacter}`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          characterData: data,
        })
      })
      .then(() => {
        this.setState({
          profileSuccess: true,
        }, () => {
          this.showToast();
        })
      })
      .catch(error => {
        console.log(error)
        this.setState({
          profileError: 'Character not found',
        }, () => {
          this.showToast();
        })
      })
  }

  // Add a character to the user's roster
  addCharacter = () => {
    const { userRegion, userRealm, userCharacter } = this.state;

    fetch('/api/characters', safeCredentials({
      method: 'POST',
      body: JSON.stringify({
        character: {
          region: userRegion,
          realm: userRealm,
          name: userCharacter,
        }
      })
    }))
      .then(handleErrors)
      .then(response => {
        if (response.success) {
          this.setState({
            userRoster: response.characters,
          })
        }
      })
      .then(() => {
        this.setState({
          characterSuccess: true,
        }, () => {
          this.showToast();
        })
      })
      .catch(error => {
        console.log(error);
        this.setState({
          characterError: 'Error adding character',
        }, () => {
          this.showToast();
        })
      })
  }

  // Combined handleChange for inputs
  handleChange = (e) => {
    const { name, value } = e.target;
     
    this.setState({
      [name]: value,
    }, () => {
      if (name === 'userRegion') {
        this.realmSwitch();
      }
    })
  }
  
  // This function is to switch the realm list based on the user's region
  // The default is blank so there is no realm list until the user selects a region
  realmSwitch = () => {
    const { realms, userRegion } = this.state;

    const us_realms = realms.us;
    const eu_realms = realms.eu;
    const kr_realms = realms.kr;
    const tw_realms = realms.tw;
    let subRealmList = [];

    switch(userRegion) {
      case 'us':
        subRealmList = us_realms;
        break;
      case 'eu':
        subRealmList = eu_realms;
        break;
      case 'kr':
        subRealmList = kr_realms;
        break;
      case 'tw':
        subRealmList = tw_realms;
        break;
      default:
        subRealmList;
    }

    this.setState({
      realmList: subRealmList,
    })
  }
  
  showToast = () => {
    this.setState({
      showToast: true,
    })

    setTimeout(this.hideToast, 5000);
  }

  hideToast = () => {
    this.setState({
      showToast: false,
    })
  }

  render() {
    const { region, characterData, realmList, profileSuccess, profileError, characterSuccess, characterError, showToast } = this.state;
    
    return (
        <Layout>
          <div className="container mx-auto px-4">
            <div className="hero min-h-[50%] bg-base-200 py-4 mb-5">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <h1 className="text-5xl font-bold">Welcome to Mounter!</h1>
                  <p className="py-6">A World of Warcraft mount finder and filter site.</p>
                </div>
              </div>
            </div>
            <div className="dropdowns flex space-x-4 justify-center py-5">
              <select className="region select select-accent" name="userRegion" onChange={this.handleChange}>
                <option>Select a Region</option>
                {region.map(region => {
                  return (
                    <option key={region} value={region}>{region.toUpperCase()}</option>
                  )
                })}
              </select>
              <select className="realm select select-accent w-44" name="userRealm" onChange={this.handleChange}>
                <option>Select a Realm</option>
                {realmList.map(realm => {
                  return (
                    <option key={realm.id} value={realm.slug}>{realm.name}</option>
                  )
                })}
              </select>
              <input type="text" placeholder="Character Name" className="input input-bordered input-accent w-52 max-w-xs" name="userCharacter" onChange={this.handleChange} />
              <button className="btn btn-primary rounded-lg" onClick={this.getProfile}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">{/* <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --> */}<path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>  
                Search
              </button>
              <button className="btn btn-secondary rounded-lg" onClick={this.addCharacter}>Add to Roster</button>
            </div>
            {profileError && showToast && (
              <div className="toast toast-end z-50">
                <div className="alert alert-error">
                  <span>{profileError}</span>
                </div>
              </div>
            )}
            {profileSuccess && showToast && (
              <div className="toast toast-end z-50">
                <div className="alert alert-success">
                  <span>Character Found</span>
                </div>
              </div>
            )}
            {characterError && showToast && (
              <div className="toast toast-end z-50">
                <div className="alert alert-error">
                  <span>{characterError}</span>
                </div>
              </div>
            )}
            {characterSuccess && showToast && (
              <div className="toast toast-end z-50">
                <div className="alert alert-success">
                  <span>Character Added</span>
                </div>
              </div>
            )}
            <div className="divider"></div>
            <Filters characterData={characterData} />
          </div>
        </Layout>
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Home />,
    document.body.appendChild(document.createElement('div')),
  )
})