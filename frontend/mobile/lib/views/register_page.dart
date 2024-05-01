import 'package:date_field/date_field.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
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

  void _onRegisterButtonPressed() {
    if (_formKey.currentState!.validate()) {
      final String name = _nameController.text;
      final String email = _emailController.text;
      final String password = _passwordController.text;

      // TODO: Implement registration logic
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
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
                    'Registrati',
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
                          recognizer: TapGestureRecognizer()
                            // TODO: change this URL to a real one
                            ..onTap = () => launchUrl(Uri.parse('https://example.com/terms')),
                        ),
                      ],
                    ),
                  ),
                  value: _isTermsAccepted,
                  onChanged: (value) => setState(() => _isTermsAccepted = value!),
                  subtitle: !_isTermsAccepted
                      ? Padding(
                          padding: EdgeInsets.fromLTRB(12.0, 0, 0, 0),
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
                  padding: const EdgeInsets.symmetric(vertical: 16.0),
                  child: FilledButton.icon(
                    onPressed: _onRegisterButtonPressed,
                    icon: const Icon(Icons.person_add),
                    label: const Text('Registrati'),
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
