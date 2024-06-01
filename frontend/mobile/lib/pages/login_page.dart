// ignore_for_file: use_build_context_synchronously


import 'package:crypt/crypt.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/user_model.dart';
import '../providers/user_provider.dart';
import '../requests/backend_requests.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isPasswordVisible = false;
  bool _showError = false;
  String _errorMessage = '';
  bool _loginButtonEnabled = true;

  late SharedPreferences _prefs;

  /// On login button pressed
  ///
  /// Validates the form and sends a request to the backend to login the user.
  void _onLoginButtonPressed() async {
    // Hide error message
    setState(() {
      _showError = false;
      _loginButtonEnabled = false;
    });

    // Validate form
    if (_formKey.currentState!.validate()) {
      // Get validated form data
      final String email = _emailController.text;
      final String password = _passwordController.text;

      // Hash the password before sending it to the backend
      Crypt passwordHash = Crypt.sha512(password, salt: '');

      // Send the login request to the backend
      Response<dynamic> response = await backendRequestUserLogin(email, passwordHash);

      // Handle the response
      if (response.statusCode == 401 && response.data['success'] == false) {
        setState(() {
          _showError = true;
        });

        if (response.data['error'] == 'Authentication failed. User not found.') {
          setState(() {
            _errorMessage = 'Utente non trovato';
          });
        } else if (response.data['error'] == 'Authentication failed. Incorrect password.') {
          setState(() {
            _errorMessage = 'Password errata';
          });
        }

        setState(() {
          _loginButtonEnabled = true;
        });

        return;
      }

      // Correct login
      if (response.statusCode == 200 && response.data['success'] == true) {

        UserModel user = UserModel(
          id: response.data['userId'],
          name: response.data['name'],
          email: response.data['email'],
          token: response.data['token'],
          points: response.data['points'],
        );

        await _prefs.setString('userId', user.id);
        await _prefs.setString('userToken', user.token);
        Provider.of<UserProvider>(context, listen: false).setUser(user);
      
        // Exit to the home page
        Navigator.of(context)..pop()..pop();
      }

      if (response.statusCode != 200 || response.statusCode != 401) {
        setState(() {
          _showError = true;
          _errorMessage = 'Si è verificato un errore. Riprova più tardi.';
        });
      }
    }
    setState(() {
      _loginButtonEnabled = true;
    });
  }

  @override
  void initState() {
    super.initState();
    SharedPreferences.getInstance().then((prefs) => _prefs = prefs);
  }

  /// Build
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Icon(
                  Icons.login,
                  size: 100,
                  color: Theme.of(context).colorScheme.onSecondaryContainer,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Text(
                    style: Theme.of(context).textTheme.titleLarge,
                    'Bentornato!',
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Text(
                    style: Theme.of(context).textTheme.titleMedium,
                    maxLines: 2,
                    softWrap: false,
                    'Accedi compilando tutti i campi.',
                  ),
                ),
                ListTile(
                  title: TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Email',
                    ),
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Campo obbligatorio';
                      }
                      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                        return 'Email non valida';
                      }
                      return null;
                    },
                  ),
                ),
                ListTile(
                  title: TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Password',
                      suffixIcon: IconButton(
                        icon: Icon(_isPasswordVisible ? Icons.visibility : Icons.visibility_off),
                        onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
                      ),
                    ),
                    obscureText: !_isPasswordVisible,
                    controller: _passwordController,
                    keyboardType: TextInputType.visiblePassword,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Campo obbligatorio';
                      }
                      return null;
                    },
                  ),
                ),
                Visibility(
                  visible: _showError,
                  child: ListTile(
                    title: Text(
                      style: Theme.of(context).textTheme.labelSmall!.copyWith(color: Theme.of(context).colorScheme.error),
                      _errorMessage,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Align(
                    alignment: Alignment.center,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor: Theme.of(context).colorScheme.onPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                      onPressed: _loginButtonEnabled ? _onLoginButtonPressed : null,
                      label: const Text('Accedi'),
                      icon: _loginButtonEnabled
                          ? const Icon(Icons.login)
                          : const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(),
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
