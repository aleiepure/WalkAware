// ignore_for_file: use_build_context_synchronously

import 'dart:io';

import 'package:android_intent_plus/android_intent.dart';
import 'package:android_intent_plus/flag.dart';
import 'package:crypt/crypt.dart';
import 'package:date_field/date_field.dart';
import 'package:dio/dio.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../requests/backend_requests.dart';
import '../pages/login_page.dart';
import 'package:url_launcher/url_launcher.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  DateTime? _bDayDate;
  bool _isTermsAccepted = true;

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  String baseUrl = const String.fromEnvironment('BACKEND_BASE_URL');

  bool _registerButtonEnabled = true;

  /// Show a dialog to the user to confirm the email address
  ///
  /// The dialog will inform the user that they need to check their email to confirm their account.
  void _showEmailConfirmationDialog() {
    showDialog(
      barrierDismissible: false,
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(Icons.alternate_email, size: 48, color: Theme.of(context).colorScheme.secondary),
        title: const Text('Conferma la tua email'),
        content:
            const Text('Dobbiamo essere sicuri che sei proprio tu. Segui le istruzioni nella mail che hai ricevuto per confermare il tuo account.'),
        actions: <Widget>[
          TextButton(
            onPressed: _onShowEmailConfirmationDialogButtonPressed,
            child: const Text('Corro a controllare!'),
          ),
        ],
      ),
    );
  }

  /// Email confirmation dialog button tap callback
  ///
  /// The method will close the bottom sheet, open the email app and navigate to the login page.
  void _onShowEmailConfirmationDialogButtonPressed() {
    // Open the email app
    if (Platform.isAndroid) {
      AndroidIntent intent = const AndroidIntent(
        action: 'android.intent.action.MAIN',
        category: 'android.intent.category.APP_EMAIL',
        flags: [Flag.FLAG_ACTIVITY_NEW_TASK],
      );
      intent.launch();
    } else if (Platform.isIOS) {
      launchUrl(Uri.parse('message://'));
    }

    // Close the dialog
    Navigator.of(context).pop();

    // Redirect to the login page
    Navigator.pushReplacement<void, void>(
      context,
      MaterialPageRoute<void>(
        builder: (BuildContext context) => const LoginPage(),
      ),
    );
  }

  /// Register button tap callback
  ///
  /// The method will validate the form and send the registration request to the backend.
  void _onRegisterButtonPressed() async {
    setState(() {
      _registerButtonEnabled = false;
    });

    if (_formKey.currentState!.validate()) {
      // Get validated form data
      final String name = _nameController.text;
      final String email = _emailController.text;
      final String password = _passwordController.text;
      final int age = DateTime.now().difference(_bDayDate!).inDays ~/ 365;

      // Hash the password before sending it to the backend
      Crypt passwordHash = Crypt.sha512(password, salt: '');

      // Send the registration request to the backend
      Response<dynamic> response = await backendRequestUserRegistration(name, email, passwordHash, age);

      // Handle response
      if (response.statusCode == 400 && response.data['success'] == false) {
        if (response.data['error'] == 'A mobile user with the same email already exists.') {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Email già in uso. Riprova con un\'altra email.'),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );

          setState(() {
            _registerButtonEnabled = true;
          });
          return;
        }
      }

      if (response.statusCode == 201 && response.data['success'] == true) {
        _showEmailConfirmationDialog();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Registrazione avvenuta con successo.'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );

        setState(() {
          _registerButtonEnabled = true;
        });
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Errore durante la registrazione'),
          backgroundColor: Theme.of(context).colorScheme.primary,
        ),
      );
    }

    setState(() {
      _registerButtonEnabled = true;
    });
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
                  Icons.person_add,
                  size: 100,
                  color: Theme.of(context).colorScheme.onSecondaryContainer,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Text(
                    style: Theme.of(context).textTheme.titleLarge,
                    'Piacere di conoscerti!',
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Text(
                    style: Theme.of(context).textTheme.titleMedium,
                    maxLines: 2,
                    softWrap: false,
                    'Per creare un account, compila tutti i campi.',
                  ),
                ),
                ListTile(
                  title: TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Nome e Cognome',
                    ),
                    controller: _nameController,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Campo obbligatorio';
                      }
                      return null;
                    },
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
                      if (value.length < 10) {
                        return 'Almeno 10 caratteri';
                      }
                      return null;
                    },
                  ),
                ),
                ListTile(
                  title: TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Conferma password',
                      suffixIcon: IconButton(
                        icon: Icon(_isConfirmPasswordVisible ? Icons.visibility : Icons.visibility_off),
                        onPressed: () => setState(() => _isConfirmPasswordVisible = !_isConfirmPasswordVisible),
                      ),
                    ),
                    obscureText: !_isConfirmPasswordVisible,
                    controller: _confirmPasswordController,
                    keyboardType: TextInputType.visiblePassword,
                    validator: (value) {
                      if (value == null || value.isEmpty || value != _passwordController.text) {
                        return 'Le password non corrispondono';
                      }
                      return null;
                    },
                  ),
                ),
                ListTile(
                  title: DateTimeFormField(
                    decoration: const InputDecoration(
                      labelText: 'Data di nascita',
                    ),
                    mode: DateTimeFieldPickerMode.date,
                    firstDate: DateTime.utc(1900),
                    lastDate: DateTime.now(),
                    initialPickerDateTime: DateTime.now().subtract(const Duration(days: 365 * 18)),
                    onChanged: (DateTime? value) {
                      _bDayDate = value;
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Campo obbligatorio';
                      }
                      if (value.isAfter(DateTime.now().subtract(const Duration(days: 365 * 18)))) {
                        return 'Devi avere almeno 18 anni';
                      }
                      return null;
                    },
                  ),
                ),
                CheckboxListTile(
                  activeColor: Theme.of(context).colorScheme.primary,
                  title: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: 'Dichiaro di avere almeno 18 anni e accetto i ',
                          style: Theme.of(context).textTheme.labelLarge,
                        ),
                        TextSpan(
                          text: 'termini e condizioni d\'uso',
                          style: Theme.of(context).textTheme.labelLarge!.copyWith(color: Theme.of(context).colorScheme.primary),
                          recognizer: TapGestureRecognizer()..onTap = () => launchUrl(Uri.parse('$baseUrl/terms_conds.html')),
                        ),
                      ],
                    ),
                  ),
                  value: _isTermsAccepted,
                  onChanged: (value) => setState(() => _isTermsAccepted = value!),
                  subtitle: !_isTermsAccepted
                      ? Padding(
                          padding: const EdgeInsets.fromLTRB(12.0, 0, 0, 0),
                          child: Text(
                            'Campo obbligatorio',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.error,
                              fontSize: 12,
                            ),
                          ),
                        )
                      : null,
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
                      onPressed: _registerButtonEnabled ? _onRegisterButtonPressed : null,
                      label: const Text('Registrati'),
                      icon: _registerButtonEnabled
                          ? const Icon(Icons.person_add)
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
