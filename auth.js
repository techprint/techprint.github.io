var poolInfo = {
    region : "eu-central-1",
    id : "eu-central-1_5G0u3dpuo",
    identityId: "eu-central-1:f38fc57e-9eb5-4db3-9ef5-c1454f2098cb"
};

var poolData = {
     UserPoolId: 'eu-central-1_5G0u3dpuo',
     ClientId : '46qtvn5419ub1amjdslf1lr8c1'
 };

var token;
var user;

var onLoginHref = "test.html"
var onLogOutHref = "signin_v1.html";

var userPool;
var cognitoUser;

$(function(){
    AWSCognito.config.region = poolInfo.region;
    
    userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    cognitoUser = userPool.getCurrentUser();
    
//    getLoggedToken(cognitoUser);
    
    getCurrentUser();
    
    if(token){
        console.log("user", user)
//        TODO change view logged in
    }else{
        
    }
    
});

var getCurrentUser = function(){

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            
            if(session.isValid){
                user = cognitoUser;
                token = session.getAccessToken().getJwtToken();    
            }
        });
    }
}

var signIn = function(){
    
    $('.status-inner').hide();
    
//    var authenticationData = {
//        Username : $("#mail").val(),
//        Password : $("#password").val(),
//    };
    
    AWSCognito.config.region = poolInfo.region; //This is required to derive the endpoint
    
    var login = $("#mail").val();
    var password = $("#password").val();
    
    if(!login || !password){
        $(".status-text").text("Please fill all fields.");
        $('.status-inner').show();
        return;
    }
    
    var authenticationData = {
        Username : login,
        Password : password,
    };
    
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
            
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

    var userData = {
        Username : login,
        Pool : userPool
    };
            
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {

            AWS.config.region = poolInfo.region;

            cognitoUser.getUserAttributes(function(err, result) {
                if (err) {
                    $(".status-text").text(err.message);
                    $('.status-inner').show();
                    return;
                }
                for (i = 0; i < result.length; i++) {
                    console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
                }
                
//                $(location).attr('href', onLoginHref);
            });
        },
        onFailure: function(err) {
            $(".status-text").text(err.message);
            $('.status-inner').show();
        }
    });
}

var signUp = function(){
    
    $('.status-inner').hide();
    
    var attributeList = [];
    
    var email = $("#mail").val(); 
    var password = $("#password").val(); 
    var re_password = $("#re-password").val(); 
    
    $("#mail").disabled = true;
    
    if(password.trim() !== re_password.trim()){
            $(".status-text").text("Passwords do not match.");
            $('.status-inner').show();
            return;
    }
    
    var dataEmail = {
        Name : "email",
        Value : email
    };

    var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
//    var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);

    attributeList.push(attributeEmail);

    userPool.signUp(email, password, attributeList, null, function(err, result){
        if (err) {
            $(".status-text").text(err.message);
            $('.status-inner').show();
            return;
        }
        cognitoUser = result.user;
        
        if(cognitoUser){
            $(location).attr('href', "confirm_v1.html");
        }
        
    });
}

var resend = function(){
    $('.status-inner').hide();
    
    var email = $("#mail").val();
    var code = $("#code").val();
    
    if(!email){
        $(".status-text").text("Please fill email field.");
        $('.status-inner').show();
        return;
    }
        
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

    var userData = {
        Username : email,
        Pool : userPool
    };
            
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    cognitoUser.resendConfirmationCode(function(err, result) {
        if (err) {
            $(".status-text").text(err.message);
            $('.status-inner').show();
            return;
           }
           alert(result);
    });
}

var confirm = function(){
    
    $('.status-inner').hide();
    
    var email = $("#mail").val();
    var code = $("#code").val();
    
    if(!email || !code){
        $(".status-text").text("Please fill all fields.");
        $('.status-inner').show();
        return;
    }
        
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

    var userData = {
        Username : email,
        Pool : userPool
    };
            
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    
    cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
            $(".status-text").text(err.message);
            $('.status-inner').show();
            return;
        }
        $(location).attr('href', onLoginHref);
    });
    
}

var logout = function(){
    if(user){
        user.signOut();
    }
    
    $(location).attr('href', onLoginHref);
}