import React, { Component } from 'react'; 
import Navigation from './components/Navigation/Navigation'; 
import Logo from './components/Logo/Logo'; 
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';  
import FaceRecognition from './components/FaceRecognition/FaceRecognition'; 
import Rank from './components/Rank/Rank';  
import SignIn from './components/SignIn/SignIn';  
import Register from './components/Register/Register';
import Particles from 'react-particles-js'; 
import Clarifai from 'clarifai';
import './App.css';  

const app = new Clarifai.App({
 apiKey: '7a1755d77235496aab9be13224cf7444'
}); 

const particlesOptions = {
              particles: {
                number: {
                  value: 100, 
                  density: {
                    enable: true, 
                    value_are: 800
                  }
                }
                }
} 

class App extends Component { 
  constructor(){
    super(); 
    this.state = {
      input: '', 
      imageUrl: '', 
      box: {}, 
      route: 'signin', 
      isSignedIn: false, 
      user: {
        id: '',
        name: '',  
        email: '', 
        entries: 0, 
        joined: ''
      }
    }
  }   

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,  
        email: data.email, 
        entries: data.entries, 
        joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box; 
      const image = document.getElementById('inputimage'); 
      const width = Number(image.width); 
      const height = Number(image.height); 
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
  } 

  displayBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }  

  onButtonClick = () => {
    this.setState({imageUrl: this.state.input});
      app.models.predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
      .then(response => { 
        if(response){
          fetch('http://localhost:3000/image', {
          method: 'put', 
          headers: {'Content-Type': 'application/json'}, 
          body: JSON.stringify({
          id: this.state.user.id 
       }) 
     }) 
          .then(response => response.json()) 
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
    }
        this.displayBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err)); 
  } 

  onRouteChange = (route) => { 
    if(route === 'signin'){
      this.setState({isSignedIn: false})
    } else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() { 
    const {isSignedIn, route, box, imageUrl} = this.state;
    return (
      <div className="App"> 
      <Particles className='particles' 
              params={particlesOptions}
            />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>  
        {route === 'home' 
            ?<div> 
              <Logo />  
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonClick={this.onButtonClick}
              /> 
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div> 
          : ( 
            route === 'signin' 
              ?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
               
              
            )   
        } 
        </div> 
    );
  }
}

export default App;
